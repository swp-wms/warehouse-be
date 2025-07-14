const express = require('express');
const router = express.Router();

const {
    getAllNotification, seenNotification, getSeenNotification
} = require('../../controllers/notificationController');

router.get('', getAllNotification);
router.get('/seen/:index', getSeenNotification);
router.post('/:id', seenNotification);

module.exports = router;