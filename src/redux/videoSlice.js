import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    isRecording: false,
    isPaused: false,
    videoURL: null,
    recordedChunks: [],
    question: "What is your name?",
    questionNumber: 1,
    stream: null,
};

const videoSlice = createSlice({
    name: 'video',
    initialState,
    reducers: {
        setRecording(state, action) {
            state.isRecording = action.payload;
        },
        setPaused(state, action) {
            state.isPaused = action.payload;
        },
        setVideoURL(state, action) {
            state.videoURL = action.payload;
        },
        setRecordedChunks(state, action) {
            state.recordedChunks = action.payload;
        },
        setQuestion(state, action) {
            state.question = action.payload;
        },
        setQuestionNumber(state, action) {
            state.questionNumber = action.payload;
        },
        setStream(state, action) {
            state.stream = action.payload;
        },
        resetRecordingState(state) {
            state.isRecording = false;
            state.isPaused = false;
            state.videoURL = null;
            state.recordedChunks = [];
            state.stream = null;
        },
    },
});

export const {
    setRecording,
    setPaused,
    setVideoURL,
    setRecordedChunks,
    setQuestion,
    setQuestionNumber,
    setStream,
    resetRecordingState,
} = videoSlice.actions;

export default videoSlice.reducer;
