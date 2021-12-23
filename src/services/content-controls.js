const express = require('express');

const app = express.Router();

app.get('/:accountId', (req, res) => {
    res.status(404).json({
        "errorCode": "errors.com.epicgames.content_controls.errors.com.epicgames.content_controls.no_user_config_found",
        "message": "No user found with provided principal id"
    })
})

app.use((req, res) => {
    res.sendStatus(404);
});

app.use(
    /**
    * @param {any} err
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {express.NextFunction} next
    */
    (err, req, res, next) => {
        res.sendStatus(500);
    }
)


module.exports = app
