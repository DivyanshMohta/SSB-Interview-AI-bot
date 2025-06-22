import React from "react";
import { Link } from "react-router-dom";
import "./TestButtons.css";

function TestButton({ title, url, icon }) {
  return (
    <div className="test-button">
      <div className="test-icon">{icon}</div>
      <h3>{title}</h3>
      <Link to={url}>
        <button className="start-btn">Start</button>
      </Link>
    </div>
  );
}

function TestButtons() {
  return (
    <div className="test-buttons-container">
      <TestButton
        title="Virtual Interview"
        url="/interview"
        icon={<i className="fas fa-comments"></i>}
      />
      <TestButton
        title="TAT Test"
        url="/tat"
        icon={<i className="fas fa-image"></i>}
      />
      <TestButton
        title="WAT Test"
        url="/wat"
        icon={<i className="fas fa-font"></i>}
      />
      <TestButton
        title="SRT Test"
        url="/srt"
        icon={<i className="fas fa-tasks"></i>}
      />
    </div>
  );
}

export default TestButtons;
