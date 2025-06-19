const express = require('express');
const router = express.Router();
const { getOneDelivery,
    getDeliveryByOrder,
    createDeliveryForOrder,
    addTruckForDelivery,
    approveDelivery,
    confirmNotEnoughCarDelivery,
    confirmIsDeliverying,
    updateRealQuantityAndWeight,
    getDeliveryListForExportOrderList,
    getDeliveryListForImportOrderList
} = require('../../controllers/deliveryController');

const verifyRoles = require('../../middlewares/roleMiddleware');
const role = require('../../data/role');

router.route('/export').get(verifyRoles(role.SALESMAN, role.DELIVERY_STAFF, role.WAREHOUSE_KEEPER), getDeliveryListForExportOrderList);
router.route('/import').get(verifyRoles(role.SALESMAN, role.DELIVERY_STAFF, role.WAREHOUSE_KEEPER), getDeliveryListForImportOrderList);

router.route('/:deliveryId')
    .get(verifyRoles(role.DELIVERY_STAFF, role.SALESMAN, role.WAREHOUSE_KEEPER), getOneDelivery)
    .put(verifyRoles(role.DELIVERY_STAFF), addTruckForDelivery);

router.route('/:deliveryId/real').put(verifyRoles(role.WAREHOUSE_KEEPER), updateRealQuantityAndWeight);

router.route('/:deliveryId/approve').put(verifyRoles(role.SALESMAN), approveDelivery);
router.route('/:deliveryId/not-enough-truck').put(verifyRoles(role.DELIVERY_STAFF), confirmNotEnoughCarDelivery);
router.route('/:deliveryId/is-deliverying').put(verifyRoles(role.DELIVERY_STAFF), confirmIsDeliverying);

router.route('/order/:orderId')
    .get(verifyRoles(role.DELIVERY_STAFF, role.SALESMAN, role.WAREHOUSE_KEEPER), getDeliveryByOrder)
    .post(verifyRoles(role.SALESMAN), createDeliveryForOrder);

module.exports = router;