const express = require("express");
const router = express.Router();
const verifyRoles = require("../../middlewares/roleMiddleware");
const role = require("../../data/role");
const product = require("../../controllers/productController");

router
  .route("/")
  .get(verifyRoles(role.SALESMAN, role.WAREHOUSE_KEEPER, role.DELIVERY_STAFF), product.getAllProduct)
  .post(verifyRoles(role.SALESMAN), product.createNewProduct);

router
  .route("/:id")
  .get(
    verifyRoles(role.SALESMAN, role.WAREHOUSE_KEEPER),
    product.getOneProductById
  )
  .put(verifyRoles(role.SALESMAN), product.updateProductInformationById);

router
  .route("/quantity/:id")
  .put(verifyRoles(role.WAREHOUSE_KEEPER), product.updateProductQuantityById);
  
module.exports = router;
