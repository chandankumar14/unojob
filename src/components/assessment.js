import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AssessmentPage = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [audioBlobUrl, setAudioBlobUrl] = useState(null);
    const [audioPlayer, setAudioPlayer] = useState(null);
    const [videoBlobUrl, setVideooBlobUrl] = useState(null);
    const [VideoPlayer, setVideoPlayer] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [isAccessGranted, setIsAccessGranted] = useState(false);
    const [MediaPermissions, setMediaPermissions] = useState(true);
    const [startInterview, setstartInterview] = useState(false);
    const [defaultInstruction, setDefaultInstruction] = useState(true);
    const [firstTimeStart, setFirstTimeStart] = useState(true);
    const [baseAudio, setAudiofile] = useState(null);
    const mediaRecorderRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const timerRef = useRef(null);
    const analyserRef = useRef(null);
    const audioContextRef = useRef(null);
    const silenceStartRef = useRef(0);

    const resumeId = useSelector((state) => state.resume.resumeId);
    const navigate = useNavigate();
    // Function to get media permissions
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
        setDefaultInstruction(false);
        if (resumeId) {
            try {
                const payload = { resume_id: resumeId };
                const response = await axios.post(`https://ai-interview.unojobs.com:8000/api/v1/interview/initiate/${resumeId}`, payload);
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
    };
    const startRecording = (LEAVE) => {
        console.log(LEAVE, "leave value to check closed ")
        setIsRecording(true);
        setTimer(0);
        const mediaRecorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = mediaRecorder;
        const audioChunks = [];
        const videoChunks = [];
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
            videoChunks.push(event.data)
        };
        let isRecordingStopped = false;
        const stopRecording = () => {
            return new Promise((resolve) => {
                mediaRecorder.onstop = () => {
                    let audioUrl = null;
                    let videoUrl = null;
                    let audioBlob = null;
                    let videoBlob = null;
                    if (audioChunks.length > 0) {
                        audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                        audioUrl = URL.createObjectURL(audioBlob);
                        setAudioBlobUrl(audioUrl);
                        setAudioPlayer(audioUrl);
                    }
                    if (videoChunks.length > 0) {
                        videoBlob = new Blob(videoChunks, { type: 'video/webm' });
                        videoUrl = URL.createObjectURL(videoBlob);
                        setVideooBlobUrl(videoUrl);
                        setVideoPlayer(videoUrl);
                    }
                    resolve({ audioUrl, audioBlob, videoBlob, videoUrl });
                };
                mediaRecorder.stop();
                mediaRecorderRef.current.stop();
            });
        };
        mediaRecorder.start();
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
        source.connect(analyserRef.current);
        timerRef.current = setInterval(() => {
            setTimer((prevTimer) => prevTimer + 1);
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyserRef.current.getByteFrequencyData(dataArray);
            const totalVolume = dataArray.reduce((acc, value) => acc + value, 0);
            const averageVolume = totalVolume / bufferLength;
            console.log(averageVolume, "averageVolume");
            if (averageVolume < 30) {
                if (silenceStartRef.current === 0) {
                    silenceStartRef.current = Date.now();
                } else if (Date.now() - silenceStartRef.current > 10000) {
                    silenceStartRef.current = 0;
                    if (!isRecordingStopped) {
                        isRecordingStopped = true;
                        setLoading(true);
                        stopRecording().then(({ audioUrl, audioBlob, videoBlob, videoUrl }) => {
                            if (audioUrl && videoUrl) {
                                SaveAndNext(audioBlob);
                                setFirstTimeStart(false)
                                audioContextRef.current.close();
                                clearInterval(timerRef.current);
                            } else {
                                console.log("No media URLs generated. Cannot proceed.");
                            }
                        }).catch(err => {
                            console.log(err, "No media URLs generated. Cannot proceed.");
                        });
                    }
                }
            } else {
                silenceStartRef.current = 0;
            }
        }, 1000);
    };
    const SaveAndNext = async (AudioBlob) => {
        if (resumeId && AudioBlob) {
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
                reader.readAsDataURL(AudioBlob);
                reader.onloadend = async () => {
                    setLoading(true);
                    setAudiofile(null);
                    setIsRecording(false);
                    const base64Audio = reader.result;
                    const audioBlob = base64ToBlob(base64Audio);
                    const formData = new FormData();
                    formData.append('file', audioBlob, 'recording.wav');
                    const response = await axios.post(`https://ai-interview.unojobs.com:8000/api/v1/interview/${resumeId}`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    if (response && response !== undefined) {
                        setAudiofile(`data:audio/mp3;base64,${response.data.audio_response}`);
                        setQuestions(response.data.gpt_response);
                        setLoading(false);
                        startRecording();
                    }
                };
            } catch (error) {
                console.error("Error during SaveAndNext:", error);
            } finally {
                setLoading(false);
            }
        }
    };
    const closedInterView = async () => {
        setLoading(true);
        if (streamRef.current) {
            const tracks = streamRef.current.getTracks();
            tracks.forEach(track => track.stop());
            if (audioContextRef.current) {
                audioContextRef.current.close()
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            navigate('/feedback');
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
                    <h3 className="text-align">Instructions:</h3>
                    <ul>
                        <li>Find a quiet, well-lit area: To ensure the best possible quality for your video, try to record in a quiet, well-lit area. Avoid noisy or dimly lit locations, as these can make your video difficult to hear or see.</li>
                        <li>Face the camera directly: Position yourself in front of the camera and try to face it directly. This will help ensure that your face is clearly visible and your voice is easy to hear.</li>
                        <li>Speak clearly and loudly: When recording, speak in a clear, loud voice to ensure that your message is easy to understand.</li>
                    </ul>
                </div>
            )}
            <div>
                {MediaPermissions && (
                    <button type="button" className="btn-action btn-margin" onClick={getMediaPermissions}>
                        Grant Webcam Access
                    </button>
                )}
            </div>
            {!defaultInstruction && baseAudio && (
                <audio controls autoPlay className="btn-margin">
                    <source src={baseAudio} type="audio/mp3" />
                </audio>
            )}
            {!defaultInstruction && firstTimeStart && (
                <h3 className="text-align">Hi, I am Rea. Once you are ready, click on the Start Button</h3>
            )}
            {!defaultInstruction && isRecording && !firstTimeStart && (
                <h3 className="text-align">{questions}</h3>
            )}

            <div className="main-container">
                <div>
                    {isRecording && (
                        <div>
                            <button type="button" className="btn btn-danger">Rec</button>
                            <button type="button" className="btn btn-dark">
                                {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                            </button>
                        </div>
                    )}
                </div>
                <video className="video-width" ref={videoRef} autoPlay muted></video>
                <div className="stop-recording">
                    {isRecording && (
                        <>
                            <span className="text-style note"> Note: This video will be recorded for review</span>
                            <button type="button" className="btn-action btn-display StopInterview" onClick={() => closedInterView()}>
                                LEAVE
                            </button>
                        </>
                    )}
                </div>
            </div>

            {isAccessGranted && startInterview && (
                <button type="button" className="btn-action btn-margin" onClick={startInterviewProcess}>
                    Start Assessment
                </button>
            )}

            <div>
                {isAccessGranted && !isRecording && !startInterview && firstTimeStart && (
                    <div>
                        <span className="text-style note"> Note: This video will be record for review</span>
                        <button type="button" className="btn-action btn-start-recording btn-display" onClick={() => startRecording(false)}>
                            Start Interview
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssessmentPage;
