const express = require('express');
const router = express.Router();
const verifyRoles = require('../../middlewares/roleMiddleware');
const role = require('../../data/role');
const { createSupplements, getSupplements } = require('../../controllers/supplementsController');

router.route('/').get(verifyRoles(!role.SYSTEM_ADMIN), getSupplements).post(verifyRoles(role.WAREHOUSE_KEEPER), createSupplements);

module.exports = router;