import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import InterviewPractice from "./components/InterviewPractice";
import ComprehensiveFeedback from "./components/ComprehensiveFeedback";
import SessionsList from "./components/SessionsList";
import ErrorBoundary from "./components/ErrorBoundary";

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <ErrorBoundary>
              <InterviewPractice />
            </ErrorBoundary>
          } />
          <Route path="/interview/:sessionId" element={
            <ErrorBoundary>
              <InterviewPractice />
            </ErrorBoundary>
          } />
          <Route path="/feedback/:sessionId" element={
            <ErrorBoundary>
              <ComprehensiveFeedback />
            </ErrorBoundary>
          } />
          <Route path="/sessions" element={
            <ErrorBoundary>
              <SessionsList />
            </ErrorBoundary>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
