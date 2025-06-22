import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faMicrophone,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import "./InterviewBotSection.css";

// eslint-disable-next-line react/prop-types
function BoxComponent({ title, url, isGradio = false }) {
  return (
    <div className="box">
      <h3>{title}</h3>
      {isGradio ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <button className="start-btn">Start</button>
        </a>
      ) : (
        <Link to={url}>
          <button className="start-btn">Start</button>
        </Link>
      )}
    </div>
  );
}

function InterviewBotSection() {
  return (
    <section className="interview-bot-section">
      <div className="container">
        <div className="section-header">
          <h2>AI-Powered Interview Bot</h2>
          <p>Experience next-generation interview preparation</p>
        </div>

        <div className="bot-features">
          <div className="bot-feature">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faComments} />
            </div>
            <h3>Live Chat Interface</h3>
            <p>Interactive chatbox for real-time responses</p>
          </div>

          <div className="bot-feature">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faMicrophone} />
            </div>
            <h3>Text & Voice Input</h3>
            <p>Allow users to type or speak answers</p>
          </div>

          <div className="bot-feature">
            <div className="feature-icon">
              <FontAwesomeIcon icon={faChartLine} />
            </div>
            <h3>Instant Feedback</h3>
            <p>Show strengths, weaknesses, and suggested improvements</p>
          </div>
        </div>

        <div className="boxes-container" id="boxes-section">
          <BoxComponent title="Virtual Interview" url="/interview" />
          <BoxComponent
            title="TAT Test"
            url="http://127.0.0.1:8002"
            isGradio={true}
          />
          <BoxComponent
            title="WAT Test"
            url="http://127.0.0.1:8003"
            isGradio={true}
          />
          <BoxComponent
            title="SRT Test"
            url="http://127.0.0.1:8001"
            isGradio={true}
          />
        </div>
      </div>
    </section>
  );
}

export default InterviewBotSection;
