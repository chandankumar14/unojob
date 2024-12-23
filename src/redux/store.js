import { configureStore } from '@reduxjs/toolkit';
import videoReducer from './videoSlice';
import ReseumeReducer from "./resumeSlice"

const store = configureStore({
    reducer: {
        video: videoReducer,
        resume:ReseumeReducer
    },
});

export default store;
