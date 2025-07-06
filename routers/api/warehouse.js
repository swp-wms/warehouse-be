const express = require("express");
const router = express.Router();
const verifyRoles = require("../../middlewares/roleMiddleware");
const role = require("../../data/role");
const {
  totalWeightofWH,
  sumExport,
  sumImport,
  totalFutureWeightofWH,
  total_weight_by_brandname,
  total_weight_by_partner,
} = require("../../controllers/warehouseController");

router
  .route("/")
  .get(verifyRoles(role.WAREHOUSE_KEEPER, role.SALESMAN), totalWeightofWH);

router
  .route("/import")
  .get(verifyRoles(role.WAREHOUSE_KEEPER, role.SALESMAN), sumImport);

router
  .route("/export")
  .get(verifyRoles(role.WAREHOUSE_KEEPER, role.SALESMAN), sumExport);

router
  .route("/future/:createdate")
  .get(
    verifyRoles(role.WAREHOUSE_KEEPER, role.SALESMAN),
    totalFutureWeightofWH
  );

router
  .route("/brandname")
  .get(
    verifyRoles(role.WAREHOUSE_KEEPER, role.SALESMAN),
    total_weight_by_brandname
  );

router
  .route("/partner")
  .get(
    verifyRoles(role.WAREHOUSE_KEEPER, role.SALESMAN),
    total_weight_by_partner
  );

module.exports = router;
