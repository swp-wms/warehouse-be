const express = require('express');
const router = express.Router();
const { getOneDelivery, getDeliveryByOrder, createDeliveryForOrder } = require('../../controllers/deliveryController');
const verifyRoles = require('../../middlewares/roleMiddleware');
const role = require('../../data/role');

router.route('/:deliveryId').get(verifyRoles(role.DELIVERY_STAFF, role.SALESMAN, role.WAREHOUSE_KEEPER), getOneDelivery);
router.route('/order/:orderId')
    .get(verifyRoles(role.DELIVERY_STAFF, role.SALESMAN, role.WAREHOUSE_KEEPER), getDeliveryByOrder)
    .post(verifyRoles(role.SALESMAN), createDeliveryForOrder);

module.exports = router;