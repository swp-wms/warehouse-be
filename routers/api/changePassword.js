const express = require('express');
const router = express.Router();
const {changePassword} = require('../../controllers/authController');

router.route('/').post(changePassword);

module.exports = router;