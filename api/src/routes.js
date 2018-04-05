const Router = require('express').Router();

const OrderController = require('./controller/OrderController');

let orderController = new OrderController();
Router.post('/order', orderController.getOrder);

module.exports = Router;
