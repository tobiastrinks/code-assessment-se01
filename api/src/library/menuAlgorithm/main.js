const KeywordsFilter = require('./src/keywordFilter');
const Splitting = require('./src/splitting');
const NameOperations = require('./src/nameOperations');
const FinalOrder = require('./src/finalOrder');

class MenuAlgorithm {
    constructor (menu) {
        this.menu = menu;
    }
    getOrder (input) {
        // normalize
        input = input.replace(/[&\/\\#,+()$~%.'":*?!<>{}]/g, '');
        input = input.replace('-', ' ');
        input = input.toLowerCase();
        input = ' ' + input + ' ';

        // keywords
        let keywordsFilter = new KeywordsFilter(this.menu, input);

        let keywordsObj = {
            name: [],
            nb: [],
            size: [],
            conj: []
        };
        keywordsObj.name = keywordsFilter.searchName();
        keywordsObj.nb = keywordsFilter.searchNb();
        keywordsObj.size = keywordsFilter.searchSize();
        keywordsObj.conj = keywordsFilter.searchConj();

        // split products
        let splitting = new Splitting(this.menu, keywordsObj);
        let orderBlocks = splitting.splitKeywords();

        // name operations
        let nameOperations = new NameOperations(this.menu);

        for (let x = 0; x < orderBlocks.length; x++) {
            // create name blocks
            let nameBlocks = nameOperations.createNameBlocks(orderBlocks[x].items);

            // --- single nameBlock per orderBlock
            // get default product by nameBlock

            if (nameBlocks.length === 1) {
                orderBlocks[x].product = nameOperations.getProductByDefault(nameBlocks[0]);
            }

            // --- multiple nameBlocks per orderBlock
            // match multiple nameBlocks
            if (nameBlocks.length > 1) {
                orderBlocks[x].product = nameOperations.getProductByComparison(nameBlocks);
                if (!orderBlocks[x].product) {
                    // ÜBERARBEITEN
                    console.log('could not understand you!');
                }
            }
        }

        // create final order by orderBlock
        // or create response
        let finalOrder = new FinalOrder(this.menu, orderBlocks);

        return finalOrder.createOrder();
    }
}
module.exports = MenuAlgorithm;
