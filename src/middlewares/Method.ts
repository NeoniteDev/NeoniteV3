// @ts-nocheck

import { Request, Response, NextFunction, Handler } from 'express-serve-static-core'
import errors from '../utils/errors';

export default function validateMethod(_router: any): () => Handler {
    return function (req: Request, res: Response, next: NextFunction) {
        /** 
         * @param {Router} ParentRouter
         * @returns {Layer}
         */
        function FindRouter(ParentRouter: any, path: string) {
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