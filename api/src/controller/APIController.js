const RequestValidator = require('../library/RequestValidator');

class APIController {
    constructor () {
        this.requestValidator = new RequestValidator();
    };
    handleRequest (requestValidError, databaseCallback, res, req, async = false) {
        if (requestValidError === false) {
            let result = databaseCallback();
            let responsePromise = new Promise(resolve => {
                if (!async) {
                    resolve(result);
                } else {
                    result.then(asyncResult => {
                        resolve(asyncResult);
                    }).catch(asyncResult => {
                        resolve(asyncResult);
                    });
                }
            });
            responsePromise.then(result => {
                this.handleResponse(res, result, req);
            });
        } else {
            let badRequest = {
                error: requestValidError
            };
            res.status(400).json(badRequest);
        }
    };
    handleResponse (res, jsonObject, req) {
        if (jsonObject) {
            if (jsonObject.error === undefined) {
                res.json(jsonObject);
            } else {
                let errorObj = {
                    error: {
                        type: 'INTERNAL_SERVER_ERROR',
                        msg: jsonObject.error
                    }
                };
                res.status(500).json(errorObj);
            }
        } else {
            let errorObj = {
                error: {
                    type: 'SERVER_ERROR',
                    msg: ''
                }
            };
            res.status(500).json(errorObj);
        }
    };
    formatRealmObj (objectElem, emptyToUndefined = false, deleteRealmFlags = true) {
        let result = null;
        let worker = objectElem;
        if (typeof worker === 'object' && !(worker instanceof Date) && !Array.isArray(worker)) {
            let toArray = false;
            for (let key in worker) {
                if (key === '0') {
                    toArray = true;
                    break;
                }
            }
            if (toArray) {
                result = [];
                worker = Array.from(worker);
                for (let x = 0; x < worker.length; x++) {
                    result[x] = this.formatRealmObj(worker[x], emptyToUndefined, deleteRealmFlags);
                }
            } else if (JSON.stringify(worker) === JSON.stringify({})) {
                if (!emptyToUndefined) {
                    result = [];
                } else {
                    result = undefined;
                }
            } else if (worker === null) {
                if (emptyToUndefined) {
                    result = undefined;
                }
            } else {
                result = {};
                for (let key in worker) {
                    // remove realm flags
                    if ((key !== 'deleted' && key !== 'created') || !deleteRealmFlags) {
                        let newObj = this.formatRealmObj(worker[key], emptyToUndefined, deleteRealmFlags);
                        if (newObj !== undefined) {
                            result[key] = newObj;
                        } else {
                            delete result[key];
                        }
                    }
                }
            }
        } else {
            if (Array.isArray(objectElem) && !objectElem.length && emptyToUndefined) {
                result = undefined;
            } else if (Array.isArray(worker)) {
                result = [];
                worker.forEach((workerItem, x) => {
                    result[x] = this.formatRealmObj(workerItem, emptyToUndefined, deleteRealmFlags);
                });
            } else {
                result = objectElem;
            }
        }
        return result;
    };
}
module.exports = APIController;
