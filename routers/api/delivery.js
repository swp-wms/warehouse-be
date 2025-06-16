const express = require('express');
const router = express.Router();
const { getOneDelivery,
    getDeliveryByOrder,
    createDeliveryForOrder,
    addTruckForDelivery,
    approveDelivery, 
    getDeliveryListForExportOrderList,
    getDeliveryListForImportOrderList
} = require('../../controllers/deliveryController');

const verifyRoles = require('../../middlewares/roleMiddleware');
const role = require('../../data/role');

router.route('/export').get(verifyRoles(role.SALESMAN), getDeliveryListForExportOrderList);
router.route('/import').get(verifyRoles(role.SALESMAN), getDeliveryListForImportOrderList);

router.route('/:deliveryId')
    .get(verifyRoles(role.DELIVERY_STAFF, role.SALESMAN, role.WAREHOUSE_KEEPER), getOneDelivery)
    .put(verifyRoles(role.DELIVERY_STAFF), addTruckForDelivery);

router.route('/:deliveryId/approve').put(verifyRoles(role.SALESMAN), approveDelivery);

router.route('/order/:orderId')
    .get(verifyRoles(role.DELIVERY_STAFF, role.SALESMAN, role.WAREHOUSE_KEEPER), getDeliveryByOrder)
    .post(verifyRoles(role.SALESMAN), createDeliveryForOrder);

module.exports = router;