const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const cors = require('cors');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const port = 8080;

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configure multer for file upload handling
const upload = multer({ dest: 'uploads/' });

// Box API settings
const BOX_API_URL = 'https://upload.box.com/api/2.0/files/content';
const BOX_TOKEN_URL = 'https://api.box.com/oauth2/token';
const FOLDER_ID = '291988293099';

// Initialize access token and refresh token from environment variables
let accessToken = process.env.BOX_ACCESS_TOKEN;
let refreshToken = process.env.BOX_REFRESH_TOKEN;

async function refreshBoxToken() {
    try {
        const response = await axios.post(BOX_TOKEN_URL, new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: process.env.BOX_CLIENT_ID,
            client_secret: process.env.BOX_CLIENT_SECRET
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;

        // Save new tokens to .env for persistence
        fs.writeFileSync('.env',
            `BOX_CLIENT_ID=${process.env.BOX_CLIENT_ID}\n` +
            `BOX_CLIENT_SECRET=${process.env.BOX_CLIENT_SECRET}\n` +
            `BOX_ACCESS_TOKEN=${accessToken}\n` +
            `BOX_REFRESH_TOKEN=${refreshToken}\n`
        );

        console.log("Access token refreshed successfully.");
    } catch (error) {
        console.error("Failed to refresh Box token:", error.response?.data || error.message);
    }
}

async function uploadToBox(req, res) {
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    try {
        if (!fs.existsSync(filePath)) {
            return res.status(500).json({ error: "File not found after upload. Please try again." });
        }

        // Prepare form data
        const fileStream = fs.createReadStream(filePath);
        const formData = new FormData();
        formData.append('attributes', JSON.stringify({ name: fileName, parent: { id: FOLDER_ID } }));
        formData.append('file', fileStream);

        // Upload to Box
        const response = await axios.post(BOX_API_URL, formData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                ...formData.getHeaders()
            }
        });

        res.status(200).json({ message: 'File uploaded successfully!', data: response.data });
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log("Access token expired, refreshing...");
            await refreshBoxToken();  // Refresh token without deleting the file
            return uploadToBox(req, res);  // Retry upload with new token
        }

        console.error("Error uploading to Box:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to upload file to Box" });
    } finally {
        // Delete the file only if it still exists and the upload was not retried
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}

// POST endpoint to receive the audio file
app.post('/api/upload-audio', upload.single('audio'), uploadToBox);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
