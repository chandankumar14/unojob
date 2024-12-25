import React, { useState } from 'react';
import logo from '../logo.svg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setResumeId } from '../redux/resumeSlice';

const WelcomeScreen = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [startAssesment, setAssesment] = useState(false);
  const [showUpload, setIsUploadingStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleStartAssessment = () => {
    navigate('/assessment');
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleUploadResume = async () => {
    if (!file) {
      alert('Please select a file before uploading.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);  
      setIsUploading(true); 
      const response = await axios.post('http://20.204.110.86:8000/api/v1/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if(response && response!==undefined){
        const data = response.data;
        const resumeId = data.resume_id;
        console.log(resumeId);
        dispatch(setResumeId(resumeId));
        setAssesment(true);
        setIsUploadingStatus(false);
      }
     
    } catch (error) {
      console.log(error)
      alert('There was an error uploading your resume. Please try again.');
    } finally {
      setLoading(false);  
      setIsUploading(false);
    }
  };

  return (
    <div className="welcomepage">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      
      <img src={logo} className="App-logo" alt="logo" />
      <h1>Welcome to the Unojobs AI Assessment</h1>
      <p>Congratulations on your interview assessment! The recruiter at X Company liked your profile and wants to learn more through a video-based interaction.</p>
      <p>This assessment will take approximately 25–30 minutes and can be done in parts:</p>
      <ul>
        <li>Resume Questions (10 mins)</li>
        <li>Job Questions (10 mins)</li>
        <li>Common Questions (10 mins)</li>
      </ul>
      <p><strong>You have 5 days to complete this.</strong></p>
      <h3>Instructions:</h3>
      <ul>
        <li>Find a quiet, well-lit area: To ensure the best possible quality for your video, try to record in a quiet, well-lit area. Avoid noisy or dimly lit locations, as these can make your video difficult to hear or see.</li>
        <li>Face the camera directly: Position yourself in front of the camera and try to face it directly. This will help ensure that your face is clearly visible and your voice is easy to hear.</li>
        <li>Speak clearly and loudly: When recording, speak in a clear, loud voice to ensure that your message is easy to understand.</li>
      </ul>

      {showUpload && (
        <input
          className="btn-action file-upload"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      )}

      {showUpload && (
        <button
          type="button"
          onClick={handleUploadResume}
          className="btn-action upload-resume"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Resume'}
        </button>
      )}

      {startAssesment && (
        <button
          type="button"
          onClick={handleStartAssessment}
          className="btn-action btn-margin"
        >
          Start Assessment
        </button>
      )}
    </div>
  );
};

export default WelcomeScreen;
