import React from "react";
import "./base.css";
import "./FeaturesSection.css";

function FeaturesSection() {
  return (
    <section className="features-section">
      <h2 className="features-title">Our Features</h2>

      <div className="feature-row">
        <div className="feature-text">
          <h3>Real-Time Interview Simulations</h3>
          <p>
            Experience realistic SSB interview scenarios with our AI-generated
            questions, designed to match actual SSB interview patterns and
            assessment criteria.
          </p>
        </div>
        <div className="feature-image">
          <img src="/images/features/ai-interview.jpg" alt="AI Interview" />
        </div>
      </div>

      <div className="feature-row">
        <div className="feature-image">
          <img src="/images/features/feedback.jpg" alt="Feedback System" />
        </div>
        <div className="feature-text">
          <h3>Instant Feedback & Evaluation</h3>
          <p>
            Receive immediate AI-based scoring and detailed improvement
            suggestions after each practice session, helping you understand your
            strengths and areas for improvement.
          </p>
        </div>
      </div>

      <div className="feature-row">
        <div className="feature-text">
          <h3>Personalized Coaching</h3>
          <p>
            Get customized guidance based on your responses and performance
            patterns, ensuring focused improvement in areas that matter most for
            your success.
          </p>
        </div>
        <div className="feature-image">
          <img
            src="/images/features/coaching.jpg"
            alt="Personalized Coaching"
          />
        </div>
      </div>

      <div className="feature-row">
        <div className="feature-image">
          <img src="/images/features/gto-tests.jpg" alt="Group Tasks" />
        </div>
        <div className="feature-text">
          <h3>Mock GTO & Psychological Tests</h3>
          <p>
            Practice with simulated Group Tasks and Psychological Tests that
            mirror the actual SSB assessment, preparing you thoroughly for every
            aspect of the selection process.
          </p>
        </div>
      </div>

      <div className="feature-row">
        <div className="feature-text">
          <h3>Previous Year Questions Database</h3>
          <p>
            Access our comprehensive collection of past SSB interview questions
            and scenarios, giving you insights into the types of challenges you
            might face.
          </p>
        </div>
        <div className="feature-image">
          <img
            src="/images/features/database.jpg"
            alt="SSB Question Database"
          />
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
