class KeywordsFilter {
    constructor (input, services) {
        this.input = input;
        this.services = services;

        this.search = this.search.bind(this);

        this.searchForServiceResult = this.searchForServiceResult.bind(this);
        this.searchService = this.searchService.bind(this);
    }

    search (searchStr) {
        let result = [];
        let lastIndex = 0;

        let srcStr = this.input;
        let pos = -1;
        let searchSuffix = [
            'es', 'er', 'en', 'n', 'e', ''
        ];

        for (let x = 0; x < searchSuffix.length; x++) {
            let searchVal = ' ' + searchStr + searchSuffix[x] + ' ';
            pos = srcStr.indexOf(searchVal, lastIndex);
            if (pos !== -1) {
                result.push({
                    pos: pos,
                    val: searchVal
                });
                break;
            }
        }
        return result;
    };

    // --- NAME

    searchForServiceResult (searchStr, serviceName, result = []) {
        let searchRes = this.search(searchStr);
        if (searchRes.length) {
            for (let x = 0; x < searchRes.length; x++) {
                let resultObj = {
                    inputPos: searchRes[x].pos,
                    inputVal: searchRes[x].val,
                    name: serviceName
                };
                result.push(resultObj);
            }
        }
        return result;
    };
    searchService () {
        let that = this;
        let result = [];
        this.services.forEach(servicesItem => {
            servicesItem.keywords.forEach(keyword => {
                result = that.searchForServiceResult(keyword, servicesItem.name, result);
            });
        });
        // order by inputPos
        result = result.sort((a, b) => {
            return parseInt(a.inputPos) - parseInt(b.inputPos);
        });

        return result;
    };
}

module.exports = KeywordsFilter;
