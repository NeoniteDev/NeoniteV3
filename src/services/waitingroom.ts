import PromiseRouter from 'express-promise-router';

const app = PromiseRouter();

app.get('/api/waitingroom', (req, res) => res.status(204).end());

module.exports = app;