class FinalOrder {
    constructor (order) {
        this.order = order;
    }
    create () {
        let result = [];
        this.order.forEach(order => {
            result.push({
                'name': order.name
            });
        });
        return result;
    }
}
module.exports = FinalOrder;
