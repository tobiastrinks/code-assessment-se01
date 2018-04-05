const cfg = require('../cfg');

class KeywordsFilter {
    constructor (menu, input) {
        this.menu = menu;
        this.input = input;

        this.search = this.search.bind(this);

        this.searchForNameResult = this.searchForNameResult.bind(this);
        this.searchName = this.searchName.bind(this);

        this.searchForNbResult = this.searchForNbResult.bind(this);
        this.searchNb = this.searchNb.bind(this);

        this.searchSizeByObjKey = this.searchSizeByObjKey.bind(this);
        this.searchForSizeResult = this.searchForSizeResult.bind(this);
        this.searchSize = this.searchSize.bind(this);

        this.searchForConjResult = this.searchForConjResult.bind(this);
        this.searchConj = this.searchConj.bind(this);
    }

    search (searchStr, space = true) {
        let result = [];
        let lastIndex = 0;

        let srcStr = this.input;
        let pos = -1;
        let searchSuffix = [
            'es', 'er', 'en', 'n', 'e', ''
        ];
        let currentSpace = true;
        do {
            do {
                for (let x = 0; x < searchSuffix.length; x++) {
                    let searchVal = searchStr + searchSuffix[x];
                    if (currentSpace) {
                        searchVal = ' ' + searchVal + ' ';
                    }
                    pos = srcStr.indexOf(searchVal, lastIndex);
                    if (pos !== -1) {
                        result.push({
                            pos: pos,
                            val: searchVal,
                            space: currentSpace
                        });
                        // try not to search without spaces
                        space = true;
                        break;
                    }
                }
                lastIndex = pos + 1;
            } while (pos !== -1);
            if (!space && currentSpace) {
                currentSpace = false;
            } else {
                space = true;
            }
        } while (space === false);
        return result;
    };

    // --- NAME

    searchForNameResult (searchStr, menuPos, defaultSynonymsName, result, alone = true) {
        let searchRes = this.search(searchStr, false);
        if (searchRes.length) {
            for (let x = 0; x < searchRes.length; x++) {
                let resultObj = {
                    inputPos: searchRes[x].pos,
                    inputVal: searchRes[x].val,
                    space: searchRes[x].space,
                    alone: alone,
                    name: searchStr
                };
                if (menuPos) {
                    // element from menu
                    resultObj.menuPos = menuPos;
                } else {
                    // defaultSynonym
                    resultObj.defaultSynonymsName = defaultSynonymsName;
                }
                result.push(resultObj);
            }
        }
        return result;
    };
    searchName (drinks = false, index = [], result = [], defaultSynonymsResults = []) {
        let parentRecursive = false;
        if (drinks === false) {
            drinks = this.menu.drinks;
            parentRecursive = true;
        }

        if (!index.length) {
            // not recursive!
            // get all defaultSynonyms first
            let defaultSynonyms = cfg.defaultSynonyms;
            for (let x = 0; x < defaultSynonyms.length; x++) {
                let currentElem = defaultSynonyms[x];
                for (let y = 0; y < currentElem.synonym.length; y++) {
                    let synonym = currentElem.synonym[y];
                    defaultSynonymsResults = this.searchForNameResult(synonym, false, currentElem.name, defaultSynonymsResults);
                }
            }
        }

        for (let x = 0; x < drinks.length; x++) {
            let newIndex = index.slice(); // copy by value
            // recursive for getting all childrens
            newIndex.push(x);
            if (drinks[x].child) {
                result = this.searchName(drinks[x].child, newIndex, result, defaultSynonymsResults);
            }
            // search for name
            let drinkName = drinks[x].name;
            let alone = (drinks[x].alone !== undefined) ? drinks[x].alone : true;
            result = this.searchForNameResult(drinkName, newIndex, false, result, alone);
            if (drinks[x].synonym) {
                for (let y = 0; y < drinks[x].synonym.length; y++) {
                    result = this.searchForNameResult(drinks[x].synonym[y], newIndex, false, result, alone);
                }
            }
            // search for defaultSynonym <> menu matches
            for (let y = 0; y < defaultSynonymsResults.length; y++) {
                let synonym = defaultSynonymsResults[y];
                if (synonym.defaultSynonymsName === drinkName) {
                    result.push({
                        inputPos: synonym.inputPos,
                        inputVal: synonym.inputVal,
                        name: synonym.defaultSynonymsName,
                        menuPos: newIndex
                    });
                }
            }
        }

        // order by inputPos
        result = result.sort((a, b) => {
            return parseInt(a.inputPos) - parseInt(b.inputPos);
        });

        if (parentRecursive) {
            // before return to main
            // filter nonSpace results > check if they are connectedWords
            let nonSpace = result.filter(item => {
                return !item.space;
            });
            let searchNonSpaceConnection = (item) => {
                let before = false;
                let after = false;
                for (let x = 0; x < 2; x++) {
                    if (!x) {
                        // search before
                        nonSpace.forEach(search => {
                            let searchEnd = search.inputPos + search.inputVal.length;
                            if (searchEnd === item.inputPos) {
                                before = true;
                            }
                        });
                    } else {
                        // search after
                        nonSpace.forEach(search => {
                            let searchStart = search.inputPos;
                            if (searchStart === item.inputPos + item.inputVal.length) {
                                after = true;
                            }
                        });
                    }
                }
                if (before || after) {
                    return true;
                }
            };
            for (let x = 0; x < result.length; x++) {
                if (!result[x].space) {
                    if (!searchNonSpaceConnection(result[x])) {
                        result.splice(x, 1);
                        x--;
                    }
                }
            }
        }

        return result;
    };

    // --- NUMBER

    searchForNbResult (searchStr, val, result) {
        let searchRes = this.search(searchStr);
        if (searchRes.length) {
            for (let x = 0; x < searchRes.length; x++) {
                result.push({
                    inputPos: searchRes[x].pos,
                    inputVal: searchRes[x].val,
                    nb: searchStr,
                    val: val
                });
            }
        }
        return result;
    }
    searchNb () {
        let nbWords = cfg.numbers.content;
        let result = [];
        for (let x = 0; x < nbWords.length; x++) {
            result = this.searchForNbResult(nbWords[x].val, nbWords[x].val, result);
            for (let y = 0; y < nbWords[x].synonym.length; y++) {
                result = this.searchForNbResult(nbWords[x].synonym[y], nbWords[x].val, result);
            }
        }
        return result;
    };

    // --- SIZE

    searchForSizeResult (searchStr, sizeVal, result) {
        let searchRes = this.search(searchStr);
        if (searchRes.length) {
            for (let x = 0; x < searchRes.length; x++) {
                result.push({
                    inputPos: searchRes[x].pos,
                    inputVal: searchRes[x].val,
                    size: searchStr,
                    val: sizeVal
                });
            }
        }
        return result;
    }
    searchSizeByObjKey (objKey, result) {
        let searchObj = cfg.size[objKey];
        for (let x = 0; x < searchObj.length; x++) {
            if (objKey === 'var') {
                for (let y = 0; y < searchObj[x].synonym.length; y++) {
                    result = this.searchForSizeResult(searchObj[x].synonym[y], searchObj[x].val, result);
                }
            } else {
                result = this.searchForSizeResult(searchObj[x], objKey, result);
            }
        }
        return result;
    }
    searchSize () {
        let result = [];

        // search for general sizes
        result = this.searchSizeByObjKey('small', result);
        result = this.searchSizeByObjKey('big', result);
        // search for specific sizes
        result = this.searchSizeByObjKey('var', result);

        return result;
    };

    // --- CONJUNCTIONS

    searchForConjResult (searchStr, type, result) {
        let searchRes = this.search(searchStr);
        if (searchRes.length) {
            for (let x = 0; x < searchRes.length; x++) {
                result.push({
                    inputPos: searchRes[x].pos,
                    inputVal: searchRes[x].val,
                    conj: searchStr,
                    type: type
                });
            }
        }
        return result;
    };
    searchConj () {
        let conjObj = cfg.conjunction;
        let result = [];
        for (let key in conjObj) {
            let currentObj = conjObj[key];
            for (let x = 0; x < currentObj.length; x++) {
                result = this.searchForConjResult(currentObj[x], key, result);
            }
        }
        return result;
    };
}

module.exports = KeywordsFilter;
