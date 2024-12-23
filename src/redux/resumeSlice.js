import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    resumeId: null,
};

const resumeSlice = createSlice({
    name: 'resume',
    initialState,
    reducers: {
        setResumeId: (state, action) => {
            state.resumeId = action.payload;
        },
        resetResumeId: (state) => {
            state.resumeId = null;
        },
    },
});


export const { setResumeId, resetResumeId } = resumeSlice.actions;


export default resumeSlice.reducer;
