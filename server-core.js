'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const messages = [];

function getMessages(params) {
    const filterParams = [];
    if (params.from) {
        filterParams.from = params.from;
    }

    if (params.to) {
        filterParams.to = params.to;
    }

    return filterMessages(filterParams);
}

function postMessage(params) {
    const msg = { text: params.text };
    if (params.from) {
        msg.from = params.from;
    }

    if (params.to) {
        msg.to = params.to;
    }

    messages.push(msg);

    return msg;
}

function filterMessages(filterParams) {
    const filtered = messages.filter(message => {
        return Object.keys(filterParams).every(key => {
            return message.hasOwnProperty(key) && message[key] === filterParams[key];
        });
    });

    return filtered;
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/messages/?', (req, res) => {
    const params = req.query;
    const msgs = getMessages({ from: params.from, to: params.to });
    res.send(msgs);
});

app.post('/messages/?', (req, res) => {
    if (!req.body.text) {
        res.sendStatus(400);

        return;
    }
    const params = req.query;
    const msg = postMessage({ from: params.from, to: params.to, text: req.body.text });
    res.send(msg);
});

app.all('*', (req, res) => {
    res.sendStatus(404);
});

module.exports = app;


