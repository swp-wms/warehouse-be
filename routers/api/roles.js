const express = require('express');
const router = express.Router();
const { getRole, postRole } = require('../../controllers/roleController');
const verifyRoles = require('../../middlewares/roleMiddleware');
const role = require('../../data/role');

router.route('/').get(verifyRoles(role.SYSTEM_ADMIN), getRole).post(verifyRoles(role.SYSTEM_ADMIN), postRole);

module.exports = router;