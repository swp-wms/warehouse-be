const express = require('express');
const router = express.Router();
const verifyRoles = require("../../middlewares/roleMiddleware");
const role = require("../../data/role");
const InventoryInOutController = require('../../controllers/InventoryInOutController');


router.get('/',verifyRoles(role.SALESMAN,role.WAREHOUSE_KEEPER), InventoryInOutController.Overall);

module.exports = router;