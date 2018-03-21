/* eslint-env mocha */
'use strict';

const assert = require('assert');

const nock = require('nock');
const chalk = require('chalk');

const { execute } = require('./client-core');

const MESSAGES_PATH_RE = /\/messages\/?/;

const red = chalk.hex('#f00');
const green = chalk.hex('#0f0');

nock.disableNetConnect();

function mockRequest({ response, payload, query, method = 'get' }) {
    return nock('http://localhost:8080')[method](MESSAGES_PATH_RE, payload)
        .query(query)
        .reply(200, response);
}

function runClient(cliArgs) {
    process.argv = [
        ...process.argv.slice(0, 2),
        ...(cliArgs.split(/\s+/))
    ];

    return execute();
}

describe('Клиент', () => {
    before(() => {
        if (!nock.isActive()) {
            nock.activate();
        }
    });

    after(nock.restore);

    beforeEach(nock.cleanAll);

    it('должен отправлять сообщение и выводить на консоль', async () => {
        const messagePayload = {
            from: 'user1',
            to: 'user2',
            text: 'hello'
        };

        const expectedRequest = mockRequest({
            method: 'post',
            query: {
                from: 'user1',
                to: 'user2'
            },
            payload: { text: messagePayload.text },
            response: messagePayload
        });

        const output = await runClient('send --from=user1 --to=user2 --text=hello');

        assert.strictEqual(output, `${red('FROM')}: user1\n` +
                                   `${red('TO')}: user2\n` +
                                   `${green('TEXT')}: hello`);

        expectedRequest.done();
    });

    it('должен получать сообщения и выводить на консоль', async () => {
        const expectedRequest = mockRequest({
            query: { from: 'user1' },
            response: [
                {
                    from: 'user1',
                    text: 'text1'
                },
                {
                    from: 'user1',
                    text: 'text2'
                }
            ]
        });

        const output = await runClient('list --from=user1');

        assert.strictEqual(output, `${red('FROM')}: user1\n${green('TEXT')}: text1\n\n` +
                                   `${red('FROM')}: user1\n${green('TEXT')}: text2`
        );

        expectedRequest.done();
    });
});
