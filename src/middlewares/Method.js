const express = require('express');
const errors = require('./../structs/errors')
/**
 * @typedef {import('./../structs/types').Layer} Layer
 * @typedef {import('./../structs/types').Router} Router
 * @typedef {import('express-serve-static-core').Router} eRouter
 * @param {eRouter} _router
 */
module.exports = (_router) => {
    /**
     * @param {express.Request} req 
     * @param {express.Response} res 
     * @param {express.NextFunction} next 
     */
    return function (req, res, next) {
        /** 
         * @param {Router} ParentRouter
         * @returns {Layer}
         */
        function FindRouter(ParentRouter, path) {
            try {
                return ParentRouter.stack.find(x => x.name === 'router' && x.regexp.test(path) == true);
            } catch { return null }
        }


        var router = { handle: _router };

        if (!router) {
            return next();
        }

        var path = req.path.replace(router.path, "");

        while (router && !router.handle.stack.find(x => x.name === 'bound dispatch' && x.regexp.test(path))) {
            path = path.replace(router.path, '');
            router = FindRouter(router, path.replace(router.path, ''));
        }

        const found = router?.handle.stack.find(x => { return x.name === 'bound dispatch' && x.regexp.test(path) });

        if (found) {
            const methods = [];

            for (let method in found.route.methods) {
                methods.push(method.toLowerCase());
            }

            if (!methods.includes(req.method)) {
                res.setHeader('Allow', methods.join(','))
                if (req.method === "OPTIONS") {
                    return res.send(methods.join(', '));
                }
                else {
                    throw errors.neoniteDev.basic.methodNotAllowed
                }
            }
        }
        else {
            return next();
        }
    }
}