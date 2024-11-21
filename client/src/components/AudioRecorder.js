import React, { useState, useRef, useEffect } from 'react';

const AudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const [progress, setProgress] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null); // Store audio blob for uploading
    const mediaRecorderRef = useRef(null);
    const audioChunks = useRef([]);
    const intervalRef = useRef(null);

    const RECORDING_DURATION = 30000; // 30 seconds

    // Function to start recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunks.current = [];
            setAudioURL(null);
            setProgress(0);

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunks.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/mp3' });
                setAudioBlob(audioBlob); // Store audio blob
                const audioURL = URL.createObjectURL(audioBlob);
                setAudioURL(audioURL);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            startProgressTracking();

            setTimeout(() => stopRecording(), RECORDING_DURATION);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    // Function to stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(intervalRef.current);
        }
    };

    // Progress tracking
    const startProgressTracking = () => {
        const interval = 100;
        const totalIntervals = RECORDING_DURATION / interval;
        let currentInterval = 0;

        intervalRef.current = setInterval(() => {
            currentInterval += 1;
            setProgress((currentInterval / totalIntervals) * 100);
            if (currentInterval >= totalIntervals) {
                clearInterval(intervalRef.current);
            }
        }, interval);
    };

    // Function to upload audio
    const uploadAudio = async () => {
        if (!audioBlob) return;

        // Generate a timestamped file name
        const now = new Date();
        const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
        const fileName = `unfiltered_recording_${formattedDate}.mp3`;

        const formData = new FormData();
        formData.append('audio', audioBlob, fileName);

        try {
            const response = await fetch('http://localhost:8080/api/upload-audio', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                alert('File uploaded successfully!');
            } else {
                console.error('Upload failed:', data.error);
                alert('Failed to upload audio');
            }
        } catch (error) {
            console.error('Error uploading audio:', error);
            alert('Failed to upload audio');
        }
    };

    // Function to retake audio
    const retakeAudio = () => {
        setAudioURL(null);
        setAudioBlob(null);
        setProgress(0);
    };

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
            }
            clearInterval(intervalRef.current);
        };
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Audio Recorder</h1>
            <button onClick={startRecording} disabled={isRecording} style={{ padding: '10px 20px', marginRight: '10px' }}>
                {isRecording ? 'Recording...' : 'Start Recording'}
            </button>
            <button onClick={stopRecording} disabled={!isRecording} style={{ padding: '10px 20px' }}>
                Stop Recording
            </button>

            <div style={{ marginTop: '20px', width: '80%', margin: '20px auto', height: '20px', background: '#ddd', borderRadius: '5px' }}>
                <div
                    style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: 'green',
                        borderRadius: '5px',
                        transition: 'width 0.1s ease'
                    }}
                ></div>
            </div>

            {audioURL && (
                <div>
                    <h2>Recorded Audio:</h2>
                    <audio src={audioURL} controls />
                    <div style={{ marginTop: '20px' }}>
                        <button onClick={uploadAudio} style={{ padding: '10px 20px', marginRight: '10px' }}>Upload Audio</button>
                        <button onClick={retakeAudio} style={{ padding: '10px 20px' }}>Retake Audio</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AudioRecorder;
