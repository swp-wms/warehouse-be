const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController')
const { getRemainNumberOfBars } = require('../../controllers/orderDetailController')

router.route('/:orderId')
    .get(orderController.getOrderDetail)

router.route('/:orderid/remain').get(getRemainNumberOfBars);

module.exports = router;