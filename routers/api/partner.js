const express = require('express');
const router = express.Router();

const {
    createPartner,
    getOnePartner,
    getAllPartner,
    updatePartner
} = require('../../controllers/partnerController');

const verifyRoles = require('../../middlewares/roleMiddleware');
const role = require('../../data/role');

router.route('/')
    .post(createPartner) // addNew
    .get(getAllPartner); //getAll
router.route().get('/:partnerId', getOnePartner); //getOne
router.route().put('/:partnerId', updatePartner); //update

module.exports = router;