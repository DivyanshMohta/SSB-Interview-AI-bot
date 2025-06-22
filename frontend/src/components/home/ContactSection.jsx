import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faComments,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faTwitter,
  faInstagram,
  faFacebook,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import "./base.css";
import "./ContactSection.css";

function ContactCard({ icon, title, description, action, actionText }) {
  // Determine if actionText is an email
  const isEmail = actionText && actionText.includes("@");

  return (
    <div className="contact-card">
      <div className="contact-icon">
        <FontAwesomeIcon icon={icon} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {isEmail ? (
        <a href={`mailto:${actionText}`} className="contact-link">
          {actionText}
        </a>
      ) : action ? (
        <button className="contact-btn" onClick={action}>
          {actionText}
        </button>
      ) : null}
    </div>
  );
}

function ContactSection() {
  const startChat = () => {
    // Placeholder for chat functionality
    alert("Live Chat functionality coming soon!");
  };

  const joinForum = () => {
    // Placeholder for forum redirect
    alert("Community Forum link coming soon!");
  };

  return (
    <section className="contact-section" id="contact">
      <div className="contact-header">
        <h2>Contact Us</h2>
        <p>We&apos;re here to help you succeed in your SSB journey</p>
      </div>

      <div className="contact-grid">
        <ContactCard
          icon={faEnvelope}
          title="📧 Email Support"
          description="Get in touch with our support team"
          actionText="support@iobot.com"
        />

        <ContactCard
          icon={faComments}
          title="💬 Live Chat"
          description="Chat with our support team in real-time"
          action={startChat}
          actionText="Start Chat"
        />

        <ContactCard
          icon={faUsers}
          title="👥 Community Forum"
          description="Join our community of SSB aspirants"
          action={joinForum}
          actionText="Join Forum"
        />
      </div>

      <div className="social-links">
        <h3>Connect With Us</h3>
        <div className="social-icons">
          <a href="#" className="social-icon" aria-label="LinkedIn">
            <FontAwesomeIcon icon={faLinkedin} />
          </a>
          <a href="#" className="social-icon" aria-label="Twitter">
            <FontAwesomeIcon icon={faTwitter} />
          </a>
          <a href="#" className="social-icon" aria-label="Instagram">
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a href="#" className="social-icon" aria-label="Facebook">
            <FontAwesomeIcon icon={faFacebook} />
          </a>
          <a href="#" className="social-icon" aria-label="YouTube">
            <FontAwesomeIcon icon={faYoutube} />
          </a>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
