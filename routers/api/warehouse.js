const express = require("express");
const router = express.Router();
const verifyRoles = require("../../middlewares/roleMiddleware");
const role = require("../../data/role");
const {
  totalWeightofWH,
  sumExport,
  sumImport,
  totalFutureWeightofWH
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

  router.route("/future/:createdate")
  .get(verifyRoles(role.WAREHOUSE_KEEPER, role.SALESMAN), totalFutureWeightofWH);

module.exports = router;
