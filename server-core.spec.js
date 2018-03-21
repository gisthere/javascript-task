/* eslint-env mocha */
'use strict';

const assert = require('assert');
const supertest = require('supertest');

function prepareServer() {
    delete require.cache[require.resolve('./server-core')];

    const server = require('./server-core');

    return supertest(server);
}

function checkMessage(expectedMessage) {
    return ({ body: message }) => {
        delete message.id;

        assert.deepStrictEqual(message, expectedMessage);
    };
}

function containsMessages(expectedMessages) {
    return ({ body: messages }) => {
        for (const message of messages) {
            delete message.id;
        }

        assert.deepStrictEqual(messages, expectedMessages);
    };
}

describe('Сервер', () => {
    it('должен возвращать созданное сообщение', () =>
        prepareServer()
            .post('/messages')
            .query({ from: 'me', to: 'my friend' })
            .send({ text: 'hello' })
            .expect(checkMessage({
                from: 'me',
                to: 'my friend',
                text: 'hello'
            }))
    );

    it('должен возвращать список созданных сообщений', async () => {
        const server = prepareServer();

        await server
            .post('/messages')
            .query({ from: 'user1', to: 'user2' })
            .send({ text: 'hello, user2' });

        await server
            .post('/messages')
            .query({ from: 'user2', to: 'user1' })
            .send({ text: 'hello, user1' });

        await server
            .get('/messages')
            .expect('Content-Type', /application\/json/i)
            .expect(containsMessages([
                {
                    from: 'user1',
                    to: 'user2',
                    text: 'hello, user2'
                },
                {
                    from: 'user2',
                    to: 'user1',
                    text: 'hello, user1'
                }
            ]));
    });
});
