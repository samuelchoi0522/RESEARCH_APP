const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { refreshBoxToken } = require('../utils/env_utils.js');

const BOX_API_URL = 'https://upload.box.com/api/2.0/files/content';
const FOLDER_ID = process.env.FOLDER_ID;

// Upload to Box API
const uploadToBox = async (file) => {
    const filePath = file.path;
    const fileName = file.originalname;
    let accessToken = process.env.BOX_ACCESS_TOKEN;

    try {
        if (!fs.existsSync(filePath)) {
            throw new Error("File not found after upload. Please try again.");
        }

        // Prepare form data
        const fileStream = fs.createReadStream(filePath);
        const formData = new FormData();
        formData.append('attributes', JSON.stringify({ name: fileName, parent: { id: FOLDER_ID } }));
        formData.append('file', fileStream);

        // Upload file
        const response = await axios.post(BOX_API_URL, formData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                ...formData.getHeaders()
            }
        });

        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log("Current working directory:", process.cwd());
            console.log("Access token expired, refreshing...");
            await refreshBoxToken(); // Refresh token
            return uploadToBox(file); // Retry upload
        }
        throw error;
    } finally {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Clean up uploaded file
        }
    }
};

module.exports = { uploadToBox };
