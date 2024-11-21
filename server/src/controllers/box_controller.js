const { uploadToBox } = require('../services/box_service');

// POST endpoint handler
const uploadAudio = async (req, res) => {
    try {
        const result = await uploadToBox(req.file);
        res.status(200).json({ message: 'File uploaded successfully!', data: result });
    } catch (error) {
        console.error("Error uploading audio:", error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { uploadAudio };
