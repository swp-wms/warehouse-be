const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/orderController");
const { checkOrderComplete } = require("../../controllers/deliveryController");
const verifyRoles = require("../../middlewares/roleMiddleware");
const role = require("../../data/role");
const product = require("../../controllers/productController");

router
  .route("/")
  .post(verifyRoles(role.SALESMAN), orderController.createNewOrder);

router
  .route("/:orderId/complete")
  .put(verifyRoles(role.SALESMAN), checkOrderComplete);

router
  .route("/import")
  .get(
    verifyRoles(role.SALESMAN, role.WAREHOUSE_KEEPER, role.DELIVERY_STAFF),
    orderController.getAllImportOrders
  );
router
  .route("/export")
  .get(
    verifyRoles(role.SALESMAN, role.WAREHOUSE_KEEPER, role.DELIVERY_STAFF),
    orderController.getAllExportOrders
  );

router
  .route("/importweight")
  .get(verifyRoles(role.SALESMAN), orderController.fetchImportOrderWeight);
  
router
  .route("/exportweight")
  .get(verifyRoles(role.SALESMAN), orderController.fetchExportOrderWeight);

router
  .route("/product_general")
  .get(verifyRoles(role.SALESMAN), product.getProductGeneralSteeltypeList);

router
  .route("/:id")
  .put(verifyRoles(role.SALESMAN), orderController.updateOrder)
  .get(
    verifyRoles(role.SALESMAN, role.WAREHOUSE_KEEPER, role.DELIVERY_STAFF),
    orderController.searchOrder
  );

router
  .route("/delivery/:id")
  .get(verifyRoles(role.SALESMAN), orderController.getDeliveryDetailForOrder);

module.exports = router;
