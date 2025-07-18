const express = require('express');
const router = express.Router();
const verifyRoles = require('../../middlewares/roleMiddleware');
const role = require('../../data/role');
const { createSupplements, getSupplements,getSupplementsByOrderId,getSupplementById } = require('../../controllers/supplementsController');

router.route('/')
    .get(verifyRoles(role.SALESMAN, role.DELIVERY_MANAGER, role.WAREHOUSE_KEEPER), getSupplements)
    .post(verifyRoles(role.WAREHOUSE_KEEPER), createSupplements);

router.route('/:orderId')
    .get(verifyRoles(role.SALESMAN, role.DELIVERY_MANAGER, role.WAREHOUSE_KEEPER), getSupplementsByOrderId)

router.route('/detail/:id')
    .get(verifyRoles(role.SALESMAN, role.DELIVERY_MANAGER, role.WAREHOUSE_KEEPER),getSupplementById)

module.exports = router;