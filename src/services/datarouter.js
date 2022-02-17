const express = require('express');

const app = express.Router();

app.post('/api/v1/public/data', (req, res) => res.status(202).end())

module.exports = app
