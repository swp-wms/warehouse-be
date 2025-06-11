const express = require('express');
const router = express.Router();
const verifyRoles = require('../../middlewares/roleMiddleware');
const role = require('../../data/role');
const { createSupplements, getSupplements } = require('../../controllers/supplementsController');

router.route('/')
    .get(verifyRoles(role.SALESMAN, role.DELIVERY_MANAGER, role.WAREHOUSE_KEEPER), getSupplements)
    .post(verifyRoles(role.WAREHOUSE_KEEPER), createSupplements);

module.exports = router;