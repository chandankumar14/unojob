import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import './feedback.css';
import WelcomePage from './components/welcomePage';
import AssessmentPage from "./components/assessment" 
import FeedbackPage from './components/feedback';
import { Provider } from 'react-redux';
import Store from "./redux/store"
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={Store}>
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>
    </Router>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
