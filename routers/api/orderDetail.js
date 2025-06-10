const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController')

router.route('/:orderId')
    .get(orderController.getOrderDetail)

    module.exports = router;