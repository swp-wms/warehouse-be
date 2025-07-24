const express = require("express");
const router = express.Router();
const verifyRoles = require("../../middlewares/roleMiddleware");
const role = require("../../data/role");
const {
  getProductList,
  updateProductInformationById,
  addProduct,
  viewProductHistory,
} = require("../../controllers/productCatalogController");

router
  .route("/")
  .get(
    verifyRoles(role.SALESMAN, role.WAREHOUSE_KEEPER, role.DELIVERY_STAFF),
    getProductList
  )
  .post(verifyRoles(role.SALESMAN, role.WAREHOUSE_KEEPER), addProduct);

router
  .route("/:id")
  .put(
    verifyRoles(role.SALESMAN, role.WAREHOUSE_KEEPER),
    updateProductInformationById
  );

router
  .route("/:productid")
  .get(verifyRoles(role.SALESMAN, role.WAREHOUSE_KEEPER), viewProductHistory);

module.exports = router;
