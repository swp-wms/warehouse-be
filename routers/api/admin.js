const express = require('express');
const router = express.Router();
const register = require('../../controllers/registerController');
const { resetPasswordByAdmin } = require('../../controllers/authController');
const verifyRoles = require('../../middlewares/roleMiddleware');
const role = require('../../data/role');

router.route('/register').post(verifyRoles(role.SYSTEM_ADMIN), register);
router.route('/reset-password').post(verifyRoles(role.SYSTEM_ADMIN), resetPasswordByAdmin);

module.exports = router;