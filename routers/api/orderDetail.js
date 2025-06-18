const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController')
const verifyRoles = require('../../middlewares/roleMiddleware');
const role = require('../../data/role');

const { getRemainNumberOfBars } = require('../../controllers/orderDetailController')


router.route('/:orderId')
    .get(verifyRoles(role.SALESMAN), orderController.getOrderDetail)

router.route('/:orderid/remain').get(getRemainNumberOfBars);

module.exports = router;