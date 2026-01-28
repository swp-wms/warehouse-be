const express = require('express');
const router = express.Router();
const verifyRoles = require('../../middlewares/roleMiddleware');
const role = require('../../data/role');
const partner = require('../../controllers/partnerController');

router.route('/')
    .get(verifyRoles(role.SALESMAN), partner.getAllPartner)
    .post(verifyRoles(role.SALESMAN), partner.createNewPartner);

router.route('/:id')
    .get(verifyRoles(role.SALESMAN), partner.getPartnerById)
    .put(verifyRoles(role.SALESMAN), partner.updatePartnerByID);

module.exports = router;