const express = require('express');
const router = express.Router();
const register = require('../controllers/registerController');
const verifyRoles = require('../middlewares/roleMiddleware');
const role = require('../data/role');

router.route('/').post(verifyRoles(role.SYSTEM_ADMIN), register);

module.exports = router;