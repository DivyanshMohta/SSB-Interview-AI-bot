import React from "react";
import "./base.css";
import "./AboutUsSection.css";

function AboutUsSection() {
  return (
    <section className="about-us" id="about">
      <h2>About Us</h2>
      <p>
        Welcome to IO Bot, a state-of-the-art platform designed to revolutionize
        the way aspirants prepare for their SSB interviews and tests. Our
        platform blends the power of Generative AI and Natural Language
        Processing (NLP) to offer a highly interactive and personalized
        preparation experience.
      </p>
      <hr />
      <p>
        Founded by Vedant and Divyansh, IO Bot aims to create a community where
        aspirants can harness technology to achieve their dreams. The platform
        is further guided by esteemed mentors and advisors, including Ms.
        Pranjal Pandit and Dr. Anuradha Yenkikar, whose invaluable expertise has
        been instrumental in shaping its vision and mission.
      </p>
      <p>
        Whether you're looking to refine your responses, improve your cognitive
        abilities, or simply gain the confidence needed to succeed, IO Bot is
        here to support you every step of the way.
      </p>
    </section>
  );
}

export default AboutUsSection;
