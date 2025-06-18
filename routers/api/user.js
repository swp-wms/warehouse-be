const express = require('express');
const router = express.Router();
const { 
    getUser, 
    getAllUser, 
    getUserForAdmin,
    updateUser
} = require('../../controllers/userController');

const verifyRoles = require('../../middlewares/roleMiddleware');
const role = require('../../data/role');

router.route('/')
    .get(verifyRoles(role.SYSTEM_ADMIN), getAllUser);

router.route('/me').get(getUser);

router.route('/:id')
    .get(verifyRoles(role.SYSTEM_ADMIN), getUserForAdmin)
    .put(updateUser);

module.exports = router;