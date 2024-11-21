import React from "react";
import AudioRecorder from "../components/AudioRecorder";
import { Container, Typography } from "@mui/material";

const RecordPage = () => (
    <Container>
        <Typography variant="h4" component="h1" gutterBottom>
            Record Your Audio
        </Typography>
        <AudioRecorder />
    </Container>
);

export default RecordPage;
