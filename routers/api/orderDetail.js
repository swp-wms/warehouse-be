const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController')
const verifyRoles = require('../../middlewares/roleMiddleware');
const role = require('../../data/role');

router.route('/:orderId')
    .get(verifyRoles(role.SALESMAN), orderController.getOrderDetail)

    module.exports = router;