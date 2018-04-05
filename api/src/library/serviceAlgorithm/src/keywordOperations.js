class KeywordOperations {
    constructor (keywords) {
        this.keywords = keywords;
    }
    removeDuplicates () {
        // remove duplicates in a row
        /*
        let lastName = false;
        for (let x = 0; x < this.keywords; x++) {
            if (lastName && this.keywords[x].name === lastName) {
                this.keywords.splice(x, 1);
                x--;
            } else {
                lastName = this.keywords[x].name;
            }
        }
        */
        // remove all duplicates
        let names = [];
        for (let x = 0; x < this.keywords.length; x++) {
            let splice = false;
            for (let y = 0; y < names.length; y++) {
                if (this.keywords[x].name === names[y]) {
                    this.keywords.splice(x, 1);
                    splice = true;
                    break;
                }
            }
            if (splice) {
                x--;
            } else {
                names.push(this.keywords[x].name);
            }
        }
        return this.keywords;
    }
}
module.exports = KeywordOperations;
