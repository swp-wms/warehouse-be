const express = require('express');
const router = express.Router();
const { getCatalog, postCatalog, putCatalog } = require('../../controllers/catalogController');
const verifyRoles = require('../../middlewares/roleMiddleware');
const role = require('../../data/role');

router.route('/').get(verifyRoles(role.SALESMAN), getCatalog).post(verifyRoles(role.SALESMAN), postCatalog);
router.route('/:branchname/:steeltype').put(verifyRoles(role.SALESMAN), putCatalog);

module.exports = router;