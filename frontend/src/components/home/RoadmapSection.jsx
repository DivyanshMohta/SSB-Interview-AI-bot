import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faComments,
  faChartLine,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import "./base.css";
import "./RoadmapSection.css";

function RoadmapSection() {
  return (
    <section className="roadmap-section">
      <h2 className="roadmap-title">How It Works</h2>

      <div className="roadmap-container">
        <div className="roadmap-item">
          <div className="roadmap-icon">
            <FontAwesomeIcon icon={faUserPlus} />
          </div>
          <div className="roadmap-content">
            <h3>Step 1</h3>
            <p>Sign up & choose an interview type</p>
            <span className="roadmap-detail">
              (Personal Interview, Psychological Test, etc.)
            </span>
          </div>
        </div>

        <div className="roadmap-item">
          <div className="roadmap-icon">
            <FontAwesomeIcon icon={faComments} />
          </div>
          <div className="roadmap-content">
            <h3>Step 2</h3>
            <p>Answer AI-generated questions in real-time</p>
          </div>
        </div>

        <div className="roadmap-item">
          <div className="roadmap-icon">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div className="roadmap-content">
            <h3>Step 3</h3>
            <p>Receive instant feedback & performance analysis</p>
          </div>
        </div>

        <div className="roadmap-item">
          <div className="roadmap-icon">
            <FontAwesomeIcon icon={faTrophy} />
          </div>
          <div className="roadmap-content">
            <h3>Step 4</h3>
            <p>Track progress and improve weak areas</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RoadmapSection;
