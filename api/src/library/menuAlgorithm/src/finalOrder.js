const Helper = require('../helper');
const cfg = require('../cfg');

class finalOrder {
    constructor (menu, orderBlocks) {
        this.menu = menu;
        this.orderBlocks = orderBlocks;

        this.createOrder = this.createOrder.bind(this);
        this.specifyOrder = this.specifyOrder.bind(this);
    }

    getTypeVal (type, orderBlockIndex) {
        let worker = this.orderBlocks.slice();
        return worker[orderBlockIndex].items.filter((x) => {
            return x[type];
        }, worker[orderBlockIndex])[0];
    }
    specifyOrder (order) {
        let finalOrder = [];
        let worker = order.slice();
        while (worker.length) {
            let searchOrder = worker[0];
            let specifying = false;
            for (let x = 1; x < worker.length; x++) {
                let specifiedOrder = worker[x];
                if (specifiedOrder.name === searchOrder.name) {
                    specifying = true;
                    for (let key in searchOrder) {
                        if (!specifiedOrder[key]) {
                            worker[x][key] = searchOrder[key];
                        }
                    }
                    break;
                }
            }
            if (!specifying) {
                // no specifying was done > add search order
                finalOrder.push(searchOrder);
            }
            worker.splice(0, 1);
        }
        return finalOrder;
    }
    createOrder () {
        let drinks = this.menu.drinks;
        let order = [];

        for (let x = 0; x < this.orderBlocks.length; x++) {
            let nb = this.getTypeVal('nb', x);
            let size = this.getTypeVal('size', x);
            let product = this.orderBlocks[x].product;

            let newOrder = {};

            if (product) {
                // generate product name
                let menuPos = product.menuPos;
                let menuObj = drinks[menuPos[0]];
                for (let y = 1; y < menuPos.length; y++) {
                    menuObj = menuObj.child[menuPos[y]];
                }
                newOrder.name = menuObj.productName;
                // set category
                newOrder.category = menuObj.category ? menuObj.category : '';
                // number
                if (nb) {
                    newOrder.nb = nb.val;
                } else {
                    // default 1
                    newOrder.nb = 1;
                }
                // size
                if (size) {
                    let variations = Helper.orderObjArray(menuObj.var, 'size');
                    newOrder.size = false;
                    if (size.val === 'big') {
                        newOrder.size = variations[variations.length - 1].size;
                    } else if (size.val === 'small') {
                        newOrder.size = variations[0].size;
                    } else if (!isNaN(size.val)) {
                        newOrder.size = size.val;
                    }
                    if (!newOrder.size) {
                        // QUESTION size not available
                    }
                } else if (menuObj.var.length === 1) {
                    // only one size available
                    newOrder.size = menuObj.var[0].size;
                } else {
                    // search for default
                    let defaultVar = menuObj.var.slice().filter((x) => {
                        return x.default;
                    }, menuObj.var);
                    if (defaultVar.length) {
                        newOrder.size = menuObj.var[0].size;
                    } else {
                        // QUESTION no default size defined
                        newOrder.size = menuObj.var[0].size;
                    }
                }
                order.push(newOrder);
            } else {
                // QUESTION product not defined > should be impossible because of splitting
            }
        }
        // check if some orders were made to specify older objects
        order = this.specifyOrder(order);

        return order;
    }
}
module.exports = finalOrder;
