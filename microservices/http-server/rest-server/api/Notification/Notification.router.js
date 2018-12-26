const router = require('express').Router();
const NotificationController = require('./Notification.controller');
const context = require('../../context');

 router.get('/:username',NotificationController.getAllNotification);
router.get('/:NotificationId/:username',NotificationController.getNotification);
// // router.get('/:Notif',NotificationController.getNotification);

router.patch('/',NotificationController.updateNotification);

exports = module.exports = router;
