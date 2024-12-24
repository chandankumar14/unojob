import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AssessmentPage = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [videoUrl, setVideoUrl] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isAccessGranted, setIsAccessGranted] = useState(false);
    const [MediaPermissions, setMediaPermissions] = useState(true);
    const [startInterview, setstartInterview] = useState(false);
    const [defaultInstruction, setDefaultInstruction] = useState(true)
    const mediaRecorderRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const timerRef = useRef(null);
    const base64Audio = "data:audio/mp3;base64,string-file value"
    const resumeId = useSelector((state) => state.resume.resumeId);
    const navigate = useNavigate();
    const getMediaPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            setIsAccessGranted(true);
            setstartInterview(true);
            setMediaPermissions(false);
        } catch (err) {
            alert("Access to camera and microphone is required to start the interview.");
        }
    };
    const startInterviewProcess = async () => {
        if (resumeId) {
            try {
                const payload = { resume_id: resumeId };
                {/** replace with correct url and payload  */}
                const response = await axios.post('http://20.204.110.86:8000/api/v1/interview/initiate', payload);
                setQuestions(response.data.questions);
                startRecording();
                setstartInterview(false);
                setDefaultInstruction(false)
            } catch (error) {
                console.error("Error fetching questions:", error);
            }

        }
    }
    const startRecording = () => {
        setIsRecording(true);
        setTimer(0);
        const mediaRecorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = mediaRecorder;
        const chunks = [];
        mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
            clearInterval(timerRef.current);
        };
        mediaRecorder.start();
        timerRef.current = setInterval(() => {
            setTimer((prevTimer) => prevTimer + 1);
        }, 1000);
    };

    const stopRecording = () => {
        setIsRecording(false);
        mediaRecorderRef.current.stop();
    };

    const SaveAndNext = async () => {
        if (resumeId) {
            try {
                const payload = { resume_id: resumeId };
                {/** replace with correct url and payload  */}
                const response = await axios.post(`http://20.204.110.86:8000/api/v1/interview/${resumeId}`, payload);
                setQuestions(response.data.questions);
                setLoading(true);
                if (response && response !== undefined) {
                    startRecording();
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching questions:", error);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        }
    }

    const closeInterview = async () => {
        try {
            const payload = { resume_id: resumeId };
            {/** replace with correct url and payload  */}
            const response = await axios.post(`http://20.204.110.86:8000/api/v1/interview/${resumeId}`, payload);
            setQuestions(response.data.questions);
            setLoading(true);
            if (streamRef.current) {
                const tracks = streamRef.current.getTracks();
                tracks.forEach((track) => {
                    track.stop();
                });
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
                videoRef.current.srcObject = null;
            }
            navigate('/feedback');
            setLoading(false);
        } catch (error) {
            console.error("Error fetching questions:", error);
        } finally {
            setLoading(false);
        }

    }

    return (
        <div className="assessment-page">

            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            )}
            {defaultInstruction && (
                <div>
                    <audio controls autoplay className='btn-margin'>
                        <source src={base64Audio} type="audio/mp3" />

                    </audio>
                    <h3 className='text-align'>Instructions:</h3>
                    <ul>
                        <li>Find a quiet, well-lit area: To ensure the best possible quality for your video, try to record in a quiet, well-lit area. Avoid noisy or dimly lit locations, as these can make your video difficult to hear or see.</li>
                        <li>Face the camera directly: Position yourself in front of the camera and try to face it directly. This will help ensure that your face is clearly visible and your voice is easy to hear.</li>
                        <li>Speak clearly and loudly: When recording, speak in a clear, loud voice to ensure that your message is easy to understand.</li>
                    </ul>
                </div>
            )
            }
            <div>
                {MediaPermissions && (
                    <button
                        type="button"
                        className="btn-action btn-margin"
                        onClick={getMediaPermissions}
                    >
                        Grant Webcam Access
                    </button>
                )}
            </div>
            <div>
                {/* Display the recording timer */}
                {isRecording && (
                    <div className="timer">
                        <p>Timer: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</p>
                    </div>
                )}

            </div>
            {!defaultInstruction && (
                <h3 className='text-align'>What is your Name {questions}</h3>
            )
            }

            <div className='main-container'>
                <video className='video-width' ref={videoRef} autoPlay muted></video>
            </div>

            {isAccessGranted && startInterview && (
                <button
                    type="button"
                    className="btn-action btn-margin"
                    onClick={startInterviewProcess}
                >
                    Start Interview
                </button>
            )}

            <div>
                {isAccessGranted && !isRecording && !startInterview && (
                    <button
                        type="button"
                        className="btn-action btn-margin"
                        onClick={SaveAndNext}
                    >
                        Submit
                    </button>
                )}
            </div>

            <div className='stop-recording'>
                {isRecording && (
                    <button
                        type="button"
                        className="btn-action btn-margin"
                        onClick={stopRecording}
                    >
                        <span> Stop Recording</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default AssessmentPage;
