const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController'); 
const verifyRoles = require('../middlewares/roleMiddleware');
const role = require('../data/role')

router.route('/')
    .post(verifyRoles(role.SALESMAN),orderController.createNewOrder)

router.route('/import')
    .get(verifyRoles(role.SALESMAN,role.WAREHOUSE_KEEPER,role.DELIVERY_MANAGER),orderController.getAllImportOrders)
router.route('/export')
    .get(verifyRoles(role.SALESMAN,role.WAREHOUSE_KEEPER,role.DELIVERY_MANAGER),orderController.getAllExportOrders)

router.route('/:id')
    .put(verifyRoles(role.SALESMAN),orderController.updateOrder)
    .get(verifyRoles(role.SALESMAN,role.WAREHOUSE_KEEPER,role.DELIVERY_MANAGER),orderController.searchOrder)

    
module.exports = router;