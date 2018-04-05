const Helper = require('../helper');

class nameOperations {
    constructor (menu) {
        this.menu = menu;

        this.getProductByComparison = this.getProductByComparison.bind(this);
        this.getParent = this.getParent.bind(this);
        this.getProductByDefault = this.getProductByDefault.bind(this);
    }

    createNameBlocks (orderBlock) {
        // filter names from orderBlock
        let nameObj = orderBlock.filter((x) => {
            return x.name;
        }, orderBlock);
        // create nameObj blocks > with same inputPos
        let blocks = [];
        let newBlocks = [];
        let inputPos = -1;
        for (let x = 0; x < nameObj.length; x++) {
            if (inputPos === -1) {
                inputPos = nameObj[x].inputPos;
            }
            if (inputPos !== nameObj[x].inputPos) {
                inputPos = nameObj[x].inputPos;
                blocks.push(newBlocks);
                newBlocks = [];
            }
            newBlocks.push(nameObj[x]);
        }
        if (newBlocks.length) {
            blocks.push(newBlocks);
        }
        return blocks;
    }
    splitNameBlocks (nameBlocks) {
        let result = [];
        for (let x = 0; x < nameBlocks.length; x++) {
            for (let y = 0; y < nameBlocks[x].length; y++) {
                result.push(nameBlocks[x][y]);
            }
        }
        return result;
    }
    getProductByComparison (nameBlocks) {
        let drinks = this.menu.drinks;
        // nameBlocks is an array of different product elements which
        // have to be compared > find similarities

        // split nameBlocks
        let nameKeywords = this.splitNameBlocks(nameBlocks);

        // build similarity array
        let similarities = [];
        for (let x = 0; x < nameKeywords.length; x++) {
            similarities[x] = [nameKeywords[x]];
            for (let y = x + 1; y < nameKeywords.length; y++) {
                // compare by menuPos
                let matching = true;
                for (let z = 0; z < nameKeywords[x].menuPos.length; z++) {
                    if (nameKeywords[y].menuPos[z] !== undefined && nameKeywords[x].menuPos[z] !== nameKeywords[y].menuPos[z]) {
                        // no matching
                        matching = false;
                    }
                }
                // check if names are not the same > because then it is a specification in most cases
                if (matching && nameKeywords[x].inputVal !== nameKeywords[y].inputVal) {
                    similarities[x].push(nameKeywords[y]);
                }
            }
        }

        // compare similarity arrays (find biggest)
        let max = 0;
        let maxIndex = false;
        let maxCounter = 0;

        for (let x = 0; x < similarities.length; x++) {
            let simLength = similarities[x].length;
            if (max === simLength) {
                maxCounter++;
            }
            if (max < simLength) {
                max = simLength;
                maxIndex = x;
                maxCounter = 1;
            }
        }
        // check if there is only ONE longest chain
        if (maxCounter === 1) {
            let resultSim = similarities[maxIndex];
            // find longest menuPos
            let maxMenuPosLength = 0;
            let maxMenuPos = [];
            for (let x = 0; x < resultSim.length; x++) {
                let menuPosLength = resultSim[x].menuPos.length;
                if (menuPosLength > maxMenuPosLength) {
                    maxMenuPosLength = menuPosLength;
                    maxIndex = x;
                    maxMenuPos = resultSim[x].menuPos;
                }
            }
            // get product from menu
            let product = drinks[maxMenuPos[0]];
            for (let x = 1; x < maxMenuPos.length; x++) {
                product = product.child[maxMenuPos[x]];
            }
            // find lowest child
            while (product.child) {
                if (product.default) {
                    for (let x = 0; x < product.child.length; x++) {
                        if (product.child[x].name === product.default) {
                            product = product.child[x];
                            maxMenuPos.push(x);
                            break;
                        }
                    }
                } else {
                    // choose first child as default
                    product = product.child[0];
                    maxMenuPos.push(0);
                }
            }
            // add menuPos to find element later
            product.menuPos = maxMenuPos;
            // product is final match
            return product;
        } else {
            // not understandable
            return false;
        }
    }

    getParent (name) {
        let defaultParents = this.menu.defaultParents;
        if (defaultParents) {
            for (let x = 0; x < defaultParents.length; x++) {
                if (defaultParents[x].name === name) {
                    return defaultParents[x].parent;
                }
            }
        }
        return false;
    }

    getProductByDefault (nameBlock) {
        let drinks = this.menu.drinks;
        // layer from nameBlockObj
        let layer = 0;

        // get parent name
        let parentName = this.getParent(nameBlock[0].name);

        do {
            // search for parent in left nameBlockObj
            layer++;
            for (let x = 0; x < nameBlock.length; x++) {
                // get next parent
                let menuPos = nameBlock[x].menuPos;
                let parentObj = drinks[menuPos[0]];
                for (let y = 1; y < menuPos.length - layer; y++) {
                    parentObj = parentObj.child[menuPos[y]];
                }
                // check if parent matches defaultParents > remove nameBlock if false
                if (parentObj.name !== parentName && nameBlock.length > 1) {
                    nameBlock.splice(x, 1);
                    x--;
                }
            }
            // search for next parent
            parentName = this.getParent(parentName);
        } while (parentName && nameBlock.length > 1);

        // default from blocks created
        let defaultObj = nameBlock[0];

        // get product by menuPos
        let menuPos = defaultObj.menuPos;
        let result = drinks[menuPos[0]];
        for (let x = 1; x < menuPos.length; x++) {
            result = result.child[menuPos[x]];
        }

        // find default childs
        while (result.child !== undefined && (result.child.length || result.default)) {
            if (result.default) {
                for (let x = 0; x < result.child.length; x++) {
                    if (result.child[x].name === result.default) {
                        result = result.child[x];
                        menuPos.push(x);
                        break;
                    }
                }
            } else {
                result = result.child[0];
                menuPos.push(0);
            }
        }

        // add menuPos to find full name later
        result.menuPos = menuPos;
        return result;
    }
}

module.exports = nameOperations;
