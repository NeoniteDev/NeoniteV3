const express = require('express');

const app = express.Router();

app.get('/api/waitingroom', (req, res) => res.status(204).end());

module.exports = app;