const express = require('express');
const router = express.Router();

const {
    getAllNotification, seenNotification
} = require('../../controllers/notificationController');

router.get('', getAllNotification);
router.post('/:id', seenNotification);

module.exports = router;