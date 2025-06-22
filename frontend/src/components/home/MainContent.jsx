import React, { useState, useEffect } from "react";
import "./base.css";
import "./MainContent.css";

function MainContent() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 4;

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const scrollToBoxes = () => {
    const boxesSection = document.getElementById("boxes-section");
    if (boxesSection) {
      boxesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <section className="main-content">
      <div className="text-section">
        <h1>WELCOME TO IO BOT</h1>
        <p>
          Your trusted partner in automation and artificial intelligence
          solutions. We help businesses transform their operations with
          cutting-edge technology.
        </p>
        <button className="start-now-btn" onClick={scrollToBoxes}>
          START NOW
        </button>
      </div>

      <div className="slider-container">
        <div
          className="slider"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          <img
            src="/images/features/main1.jpg"
            alt="SSB Interview Preparation"
            className="main-image"
          />
          <img
            src="/images/features/main2.jpg"
            alt="Personality Development"
            className="main-image"
          />
          <img
            src="/images/features/main3.jpg"
            alt="Leadership Training"
            className="main-image"
          />
          <img
            src="/images/features/main4.jpg"
            alt="Group Discussion"
            className="main-image"
          />
        </div>
        <button className="slider-nav prev" onClick={handlePrevSlide}>
          ❮
        </button>
        <button className="slider-nav next" onClick={handleNextSlide}>
          ❯
        </button>
        <div className="slider-indicators">
          {[...Array(totalSlides)].map((_, index) => (
            <span
              key={index}
              className={`indicator ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            ></span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MainContent;
