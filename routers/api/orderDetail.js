const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController')
const verifyRoles = require('../../middlewares/roleMiddleware');
const role = require('../../data/role');

const { getRemainWeightOfBars } = require('../../controllers/orderDetailController')


router.route('/:orderId')
    .get(verifyRoles(role.SALESMAN,role.WAREHOUSE_KEEPER,role.DELIVERY_STAFF), orderController.getOrderDetail)

router.route('/:orderid/remain').get(getRemainWeightOfBars);

module.exports = router;