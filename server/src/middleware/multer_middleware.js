const multer = require('multer');

// Configure multer
const upload = multer({ dest: 'uploads/' });

module.exports = upload.single('audio');
