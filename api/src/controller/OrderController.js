const APIController = require('./APIController');
const MenuAlgorithm = require('../library/menuAlgorithm/main');
const ServicesAlgorithm = require('../library/serviceAlgorithm/main');

class OrderController extends APIController {
    constructor () {
        super();
        this.getOrder = this.getOrder.bind(this);
    }
    getOrder (req, res) {
        let requestErr = this.requestValidator.validRequestData(req.body, [
            {
                name: 'order',
                type: 'string',
                nValues: ['']
            }
        ]);
        this.handleRequest(requestErr, () => {
            let input = req.body.order;

            let menu = require('../library/sampleMenu');
            menu = this.formatRealmObj(menu, true);

            let menuAlgorithm = new MenuAlgorithm(menu);
            let serviceAlgorithm = new ServicesAlgorithm(menu);

            let order = {
                drinks: [],
                services: []
            };

            // search for menu orders
            order.drinks = menuAlgorithm.getOrder(input);
            // search for service orders
            order.services = serviceAlgorithm.getOrder(input);
            return order;
        }, res, req);
    }
}
module.exports = OrderController;
