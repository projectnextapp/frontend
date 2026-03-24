import React, { useState, useEffect, useCallback } from "react";
import {
  MdClose,
  MdArrowForward,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import axios from "axios";
import "./AdvertCard.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function AdvertCard() {
  const [adverts, setAdverts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trackedImpressions, setTrackedImpressions] = useState(new Set());

  const ROTATION_INTERVAL = 7000; // 7 seconds for cards
  const TRANSITION_DURATION = 600; // 600ms

  useEffect(() => {
    fetchAdverts();
  }, []);

  // Track impression - ONLY ONCE per advert per session
  useEffect(() => {
    if (adverts.length > 0 && adverts[currentIndex]) {
      const advertId = adverts[currentIndex]._id;

      // Only track if we haven't tracked this advert yet in this session
      if (!trackedImpressions.has(advertId)) {
        trackImpression(advertId);
        setTrackedImpressions((prev) => new Set([...prev, advertId]));
      }
    }
  }, [currentIndex, adverts, trackedImpressions]);

  const handleNext = useCallback(() => {
    if (isTransitioning || adverts.length <= 1) return;

    setIsTransitioning(true);
    setProgress(0);

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % adverts.length);
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
  }, [isTransitioning, adverts.length]);

  const handlePrevious = useCallback(() => {
    if (isTransitioning || adverts.length <= 1) return;

    setIsTransitioning(true);
    setProgress(0);

    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + adverts.length) % adverts.length);
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
  }, [isTransitioning, adverts.length]);

  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return;

    setIsTransitioning(true);
    setProgress(0);

    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
  };

  // Auto-rotation with progress
  useEffect(() => {
    if (adverts.length <= 1 || isPaused || isTransitioning) {
      setProgress(0);
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 100 / (ROTATION_INTERVAL / 50);
      });
    }, 50);

    const rotationTimer = setTimeout(() => {
      handleNext();
    }, ROTATION_INTERVAL);

    return () => {
      clearTimeout(rotationTimer);
      clearInterval(progressInterval);
    };
  }, [currentIndex, adverts.length, isPaused, isTransitioning, handleNext]);

  const fetchAdverts = async () => {
    try {
      const token = localStorage.getItem("agms_token");
      const res = await axios.get(`${API_URL}/api/adverts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { position: "dashboard" },
      });

      if (res.data.success) {
        setAdverts(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load adverts");
    }
  };

  const trackImpression = async (advertId) => {
    try {
      const token = localStorage.getItem("agms_token");
      await axios.post(
        `${API_URL}/api/adverts/${advertId}/impression`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (err) {
      console.error("Failed to track impression");
    }
  };

  const trackClick = async (advertId) => {
    try {
      const token = localStorage.getItem("agms_token");
      await axios.post(
        `${API_URL}/api/adverts/${advertId}/click`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (err) {
      console.error("Failed to track click");
    }
  };

  const handleDismiss = async (advertId) => {
    try {
      const token = localStorage.getItem("agms_token");
      await axios.post(
        `${API_URL}/api/adverts/${advertId}/dismiss`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const newAdverts = adverts.filter((ad) => ad._id !== advertId);
      setAdverts(newAdverts);

      if (newAdverts.length > 0 && currentIndex >= newAdverts.length) {
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error("Failed to dismiss advert");
    }
  };

  const handleClick = (advert) => {
    if (advert.link) {
      trackClick(advert._id);
      window.open(advert.link, "_blank");
    }
  };

  if (adverts.length === 0) return null;

  const advert = adverts[currentIndex];

  return (
    <div
      className="advert-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={`advert-card__wrapper ${isTransitioning ? "transitioning" : ""}`}
      >
        <button
          className="advert-card__close"
          onClick={() => handleDismiss(advert._id)}
          title="Dismiss"
        >
          <MdClose />
        </button>

        {advert.image && (
          <div className="advert-card__image">
            <img src={advert.image} alt={advert.title} />
          </div>
        )}

        <div className="advert-card__content">
          <h3>{advert.title}</h3>
          <p>{advert.description}</p>

          {advert.link && (
            <button
              className="advert-card__cta"
              onClick={() => handleClick(advert)}
            >
              Learn More <MdArrowForward />
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        {adverts.length > 1 && !isPaused && (
          <div className="advert-card__progress">
            <div
              className="advert-card__progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      {adverts.length > 1 && (
        <>
          <button
            className="advert-card__nav advert-card__nav--prev"
            onClick={handlePrevious}
            disabled={isTransitioning}
            aria-label="Previous"
          >
            <MdChevronLeft />
          </button>

          <button
            className="advert-card__nav advert-card__nav--next"
            onClick={handleNext}
            disabled={isTransitioning}
            aria-label="Next"
          >
            <MdChevronRight />
          </button>

          <div className="advert-card__indicators">
            {adverts.map((_, index) => (
              <div
                key={index}
                className={`indicator ${index === currentIndex ? "active" : ""}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>

          <div className="advert-card__count">
            {currentIndex + 1} / {adverts.length}
          </div>
        </>
      )}
    </div>
  );
}
