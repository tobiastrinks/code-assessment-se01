const KeywordFilter = require('./src/keywordFilter');
const KeywordOperations = require('./src/keywordOperations');
const FinalOrder = require('./src/finalOrder');

class ServiceAlgorithm {
    constructor () {
        this.cfg = require('./cfg');
    }
    getOrder (input) {
        // normalize
        input = input.replace(/[&\/\\#,+()$~%.'":*?!<>{}]/g, '');
        input = input.replace('-', ' ');
        input = input.toLowerCase();
        input = ' ' + input + ' ';

        // search keywords
        let keywordFilter = new KeywordFilter(input, this.cfg.services);
        let keywords = keywordFilter.searchService();

        // remove keywordDuplicates
        let keywordOperations = new KeywordOperations(keywords);
        let order = keywordOperations.removeDuplicates();

        // create finalOrder
        let finalOrder = new FinalOrder(order);
        order = finalOrder.create();

        return order;
    }
}
module.exports = ServiceAlgorithm;
