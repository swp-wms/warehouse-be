const express = require('express');
const router = express.Router();
const { getCatalog, postCatalog, putCatalog,getCatalogBrands, getCatalogPrimaryKeys, updateCatalog } = require('../../controllers/catalogController');
const verifyRoles = require('../../middlewares/roleMiddleware');
const role = require('../../data/role');

router.route('/').get(verifyRoles(role.SALESMAN), getCatalog).post(verifyRoles(role.SALESMAN), postCatalog);
router.route('/:branchname/:steeltype').put(verifyRoles(role.SALESMAN), putCatalog);

router.route('/brands').get(verifyRoles(role.SALESMAN), getCatalogBrands);
router.route('/keys').get(verifyRoles(role.SALESMAN),getCatalogPrimaryKeys);

router.route('/').put(verifyRoles(role.SALESMAN),updateCatalog);
module.exports = router;