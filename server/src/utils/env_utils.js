const fs = require('fs');
const axios = require('axios');
const BOX_TOKEN_URL = 'https://api.box.com/oauth2/token';

let accessToken = process.env.BOX_ACCESS_TOKEN;
let refreshToken = process.env.BOX_REFRESH_TOKEN;

const refreshBoxToken = async () => {
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

        // Save new tokens to .env
        fs.writeFileSync('.env',
            `BOX_CLIENT_ID=${process.env.BOX_CLIENT_ID}\n` +
            `BOX_CLIENT_SECRET=${process.env.BOX_CLIENT_SECRET}\n` +
            `BOX_ACCESS_TOKEN=${accessToken}\n` +
            `BOX_REFRESH_TOKEN=${refreshToken}\n`
        );

        console.log("Access token refreshed successfully.");
    } catch (error) {
        const errorData = error.response?.data || {};
        if (errorData.error === 'invalid_grant' && errorData.error_description === 'Refresh token has expired') {
            console.error("Refresh token has expired. Please reauthorize the application.");
        } else {
            console.error("Failed to refresh Box token:", errorData || error.message);
        }
        throw new Error("Failed to refresh Box token.");
    }
};

module.exports = { refreshBoxToken };