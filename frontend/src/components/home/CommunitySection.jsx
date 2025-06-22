import React from "react";
import "./base.css";
import "./CommunitySection.css";

function CommunitySection() {
  return (
    <section className="community-section">
      <div className="community-container">
        <h2 className="community-title">Join a growing community!</h2>
        <h3 className="community-subtitle">
          Supercharge your SSB Interview preparation
        </h3>

        <p className="community-description">
          IO Bot's powerful features make it easy for SSB aspirants to practice
          and prepare effectively. Our platform offers real-time AI-generated
          psychological questions, tools to manage your preparation process,
          intelligent follow-up scenarios, and enhanced practice capabilities
          for all SSB tests, all in one convenient place.
        </p>
      </div>
    </section>
  );
}

export default CommunitySection;
