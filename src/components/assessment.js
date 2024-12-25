import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AssessmentPage = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [videoUrl, setVideoUrl] = useState(null);
    const [blobUrl, setBlobUrl] = useState(null);
    const [recordedAudio, setRecordedaudio] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isAccessGranted, setIsAccessGranted] = useState(false);
    const [MediaPermissions, setMediaPermissions] = useState(true);
    const [startInterview, setstartInterview] = useState(false);
    const [defaultInstruction, setDefaultInstruction] = useState(true);
    const [baseAudio, setAudiofile] = useState(null);
    const mediaRecorderRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const timerRef = useRef(null);
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
        setstartInterview(false);
        setDefaultInstruction(false)
        if (resumeId) {
            try {
                const payload = { resume_id: resumeId };
                const response = await axios.post(`http://20.204.110.86:8000/api/v1/interview/initiate/${resumeId}`, payload);
                if (response && response !== undefined) {
                    setAudiofile(`data:audio/mp3;base64,${response.data.audio_response}`);
                    setQuestions(response.data.gpt_response);
                    setstartInterview(false);
                    setDefaultInstruction(false);
                }

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
            const blob = new Blob(chunks, { type: 'audio/webm' });
            setBlobUrl(blob)
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
                mediaRecorderRef.current.stop();
                const base64ToBlob = (base64, contentType = 'audio/wav') => {
                    const byteCharacters = atob(base64.split(',')[1]);
                    const byteArrays = [];
                    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                        const slice = byteCharacters.slice(offset, offset + 512);
                        const byteNumbers = new Array(slice.length).fill(0).map((_, i) => slice.charCodeAt(i));
                        byteArrays.push(new Uint8Array(byteNumbers));
                    }
                    return new Blob(byteArrays, { type: contentType });
                };
                const reader = new FileReader();
                reader.readAsDataURL(blobUrl);
                reader.onloadend = async () => {
                    setLoading(true);
                    setIsRecording(false);
                    const base64Audio = reader.result;
                    setRecordedaudio(base64Audio);
                    const audioBlob = base64ToBlob(base64Audio);
                    const formData = new FormData();
                    formData.append('file', audioBlob, 'recording.wav');
                    const response = await axios.post(`http://20.204.110.86:8000/api/v1/interview/${resumeId}`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    if (response && response !== undefined) {
                        setAudiofile(`data:audio/mp3;base64,${response.data.audio_response}`);
                        setQuestions(response.data.gpt_response);
                        setLoading(false);
                    }
                };
            } catch (error) {
                console.error("Error fetching questions:", error);
            } finally {
                setLoading(false);
            }
        }
    };



    const closeInterview = async () => {
        try {
            const formData = new FormData();
            formData.append('file', videoRef);
            {/** replace with correct url and payload  */ }
            const response = await axios.post(`http://20.204.110.86:8000/api/v1/interview/${resumeId}`, formData);
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
            setLoading(false);
            navigate('/feedback');

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

            {!defaultInstruction && (
                <audio controls autoPlay className='btn-margin'>
                    <source src={baseAudio} type="audio/mp3" />
                </audio>
            )}
            {!defaultInstruction && (
                <h3 className='text-align'>{questions}</h3>
            )
            }

            <div className='main-container'>
                <div>
                    {/* Display the recording timer */}
                    {isRecording && (
                        <div>
                            <button type="button" className="btn btn-danger">Rec</button>
                            <button type="button" className="btn btn-dark">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</button>
                        </div>
                    )}
                </div>
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
                    <div>
                        <span className='text-style'> Note: The Video is being recorded</span>
                        <button
                            type="button"
                            className="btn-action btn-start-recording btn-display"
                            onClick={startRecording}
                        >
                            Start Recording
                        </button>

                        <button
                            type="button"
                            className="btn-action btn-display"
                            onClick={stopRecording}
                        >
                            Stop Recording
                        </button>
                    </div>
                )}
            </div>

            <div className='stop-recording'>

                {isRecording && (
                    <div>
                        <span className='text-style'> Note: The Video is being recorded</span>
                        <button
                            type="button"
                            className="btn-action btn-margin"
                            onClick={SaveAndNext}
                        >
                            <span> Stop Recording</span>
                        </button>
                    </div>

                )}
            </div>
        </div>
    );
};

export default AssessmentPage;
