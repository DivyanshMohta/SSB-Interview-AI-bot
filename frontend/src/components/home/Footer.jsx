import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <img src="/logo.png" alt="IO Bot Logo" />
          <p>
            Revolutionizing psychological assessment through innovative AI
            technology and research-based methodology for more effective mental
            health support.
          </p>
          <div className="social-links">
            <a href="#">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="#">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li>
              <a href="#">
                <i className="fas fa-chevron-right"></i> Home
              </a>
            </li>
            <li>
              <a href="#">
                <i className="fas fa-chevron-right"></i> About Us
              </a>
            </li>
            <li>
              <a href="#">
                <i className="fas fa-chevron-right"></i> Services
              </a>
            </li>
            <li>
              <a href="#">
                <i className="fas fa-chevron-right"></i> Research
              </a>
            </li>
            <li>
              <a href="#">
                <i className="fas fa-chevron-right"></i> Contact
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Our Services</h3>
          <ul className="footer-links">
            <li>
              <a href="#">
                <i className="fas fa-chevron-right"></i> Interview Bot
              </a>
            </li>
            <li>
              <a href="#">
                <i className="fas fa-chevron-right"></i> SRT Assessment
              </a>
            </li>
            <li>
              <a href="#">
                <i className="fas fa-chevron-right"></i> TAT Assessment
              </a>
            </li>
            <li>
              <a href="#">
                <i className="fas fa-chevron-right"></i> WAT Assessment
              </a>
            </li>
            <li>
              <a href="#">
                <i className="fas fa-chevron-right"></i> Custom Solutions
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Info</h3>
          <ul className="contact-info">
            <li>
              <i className="fas fa-map-marker-alt"></i> 123 Research Avenue,
              Tech City, 10001
            </li>
            <li>
              <i className="fas fa-phone"></i> +1 (555) 123-4567
            </li>
            <li>
              <i className="fas fa-envelope"></i> info@iobot.research.edu
            </li>
            <li>
              <i className="fas fa-clock"></i> Monday - Friday: 9AM - 5PM
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">© 2025 IO Bot. All Rights Reserved.</div>
    </footer>
  );
};

export default Footer;
