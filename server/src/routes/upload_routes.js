const express = require('express');
const { uploadAudio } = require('../controllers/box_controller.js');
const multerMiddleware = require('../middleware/multer_middleware.js');

const router = express.Router();

router.post('/upload-audio', multerMiddleware, uploadAudio);

module.exports = router;
