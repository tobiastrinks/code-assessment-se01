'use strict';

class RequestValidator {
    validRequestData (data = {}, format = []) {
        let error = false;
        for (let x = 0; x < format.length; x++) {
            let formatItem = format[x];

            // check missing params
            if (!data.hasOwnProperty(formatItem.name) && !formatItem.optional) {
                error = {
                    type: 'PARAM_MISSING',
                    msg: 'param ' + formatItem.name + ' is missing'
                };
                break;
            } else {
                // check type
                let dataItem = data[formatItem.name];
                let dataItemType = typeof dataItem;
                if (!(formatItem.type === 'array' && Array.isArray(dataItem))) {
                    if (dataItemType !== formatItem.type) {
                        error = {
                            type: 'PARAM_TYPE',
                            msg: 'param ' + formatItem.name + ' needs to be type ' + formatItem.type
                        };
                        break;
                    }
                }
                // check possible values
                if (formatItem.values) {
                    let valueFound = false;
                    for (let y = 0; y < formatItem.values.length; y++) {
                        if (formatItem.values[y] === dataItem) {
                            valueFound = true;
                        }
                    }
                    if (!valueFound) {
                        error = {
                            type: 'PARAM_VALUE',
                            msg: 'param ' + formatItem.name + ' has no valid value'
                        };
                        break;
                    }
                }
                // check forbidden values
                if (formatItem.nvalues) {
                    for (let y = 0; y < formatItem.nvalues.length; y++) {
                        if (formatItem.nvalues[y] === dataItem) {
                            error = {
                                type: 'PARAM_VALUE',
                                msg: 'param ' + formatItem.name + ' contains a forbidden value'
                            };
                            break;
                        }
                    }
                    if (error) {
                        break;
                    }
                }
            }
        }
        return error;
    };
}
module.exports = RequestValidator;
