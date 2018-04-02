'use strict';
const commandLineArgs = require('command-line-args');
const got = require('got');
const chalk = require('chalk');
const querystring = require('querystring');

module.exports.execute = execute;
module.exports.isStar = true;

const MESSAGES_ENDPOINT = 'http://localhost:8080/messages/';

function execute() {

    const commands = ['send', 'list'];

    const args = parseCommandArgs();

    if (!commands.includes(args.command)) {
        return Promise.reject('Error');
    }

    if (args.command === 'send' && !args.text) {
        return Promise.reject('Error');
    }

    const params = {};

    if (args.from) {
        params.from = args.from;
    }

    if (args.to) {
        params.to = args.to;
    }

    if (args.command === 'send') {
        params.text = args.text;

        return sendMessage(params).then(message => Promise.resolve(colorMessages([message])));
    }

    return getMessages(params).then(messages => Promise.resolve(colorMessages(messages)));
}

function parseCommandArgs() {

    const mainDefinitions = [
        { name: 'command', type: String, defaultOption: true },
        { name: 'from', type: String },
        { name: 'to', type: String },
        { name: 'text', type: String }
    ];

    // filter empty params
    let args = commandLineArgs(mainDefinitions, { partial: true });
    args = Object.keys(args).filter(key => args[key])
        .reduce((obj, key) => {
            obj[key] = args[key];

            return obj;
        }, {});

    return args;
}

function colorMessages(messages) {
    const red = chalk.hex('#f00');
    const green = chalk.hex('#0f0');
    const result = messages.map(msg => {
        let text = '';
        if (msg.from) {
            text = text.concat(`${red('FROM')}: ${msg.from}\n`);
        }

        if (msg.to) {
            text = text.concat(`${red('TO')}: ${msg.to}\n`);
        }

        text = text.concat(`${green('TEXT')}: ${msg.text}`);

        return text;
    });

    return result.join('\n\n');
}

function sendMessage(params) {
    const query = {};
    if (params.from) {
        query.from = params.from;
    }

    if (params.to) {
        query.to = params.to;
    }
    const body = { text: params.text };


    return got.post(MESSAGES_ENDPOINT,
        {
            json: true,
            query: querystring.stringify(query),
            body: body
        }).then(res => res.body);
}

function getMessages(params) {
    return got.get(MESSAGES_ENDPOINT,
        {
            json: true,
            query: querystring.stringify(params)
        }).then(res => res.body);
}
