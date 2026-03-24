import React, { useState, useEffect, useCallback } from "react";
import {
  MdClose,
  MdOpenInNew,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import axios from "axios";
import "./AdvertBanner.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://backend-083k.onrender.com";

export default function AdvertBanner({ position = "header" }) {
  const [adverts, setAdverts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trackedImpressions, setTrackedImpressions] = useState(new Set());

  const ROTATION_INTERVAL = 5000; // 5 seconds
  const TRANSITION_DURATION = 500; // 500ms

  const fetchAdverts = useCallback(async () => {
    try {
      const token = localStorage.getItem("agms_token");
      const res = await axios.get(`${API_URL}/api/adverts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { position },
      });

      if (res.data.success) {
        setAdverts(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load adverts:", err);
    }
  }, [position]);

  useEffect(() => {
    fetchAdverts();
  }, [fetchAdverts]);

  // Track impression for current advert - ONLY ONCE per advert per session
  useEffect(() => {
    if (adverts.length > 0 && adverts[currentIndex]) {
      const advertId = adverts[currentIndex]._id;

      // Only track if we haven't tracked this advert yet in this session
      if (!trackedImpressions.has(advertId)) {
        trackImpression(advertId);
        setTrackedImpressions((prev) => new Set([...prev, advertId]));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, adverts]);

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

  // Auto-rotation with progress bar
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (adverts.length <= 1) return;

      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [adverts.length, handleNext, handlePrevious]);

  const trackImpression = async (advertId) => {
    try {
      const token = localStorage.getItem("agms_token");
      await axios.post(
        `${API_URL}/api/adverts/${advertId}/impression`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
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
        { headers: { Authorization: `Bearer ${token}` } },
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
        { headers: { Authorization: `Bearer ${token}` } },
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
      className={`advert-banner advert-banner--${position}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={`advert-banner__wrapper ${isTransitioning ? "transitioning" : ""}`}
      >
        {advert.image ? (
          <div
            className="advert-banner__with-image"
            onClick={() => handleClick(advert)}
            style={{ cursor: advert.link ? "pointer" : "default" }}
          >
            <img src={advert.image} alt={advert.title} />

            <button
              className="advert-banner__close"
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss(advert._id);
              }}
              title="Dismiss"
            >
              <MdClose />
            </button>
          </div>
        ) : (
          <div className="advert-banner__content">
            <div className="advert-banner__text">
              <h4>{advert.title}</h4>
              <p>{advert.description}</p>
            </div>

            <div className="advert-banner__actions">
              {advert.link && (
                <button
                  className="btn-advert-action"
                  onClick={() => handleClick(advert)}
                >
                  Learn More <MdOpenInNew />
                </button>
              )}
              <button
                className="btn-advert-close"
                onClick={() => handleDismiss(advert._id)}
                title="Dismiss"
              >
                <MdClose />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {adverts.length > 1 && !isPaused && (
        <div className="advert-banner__progress">
          <div
            className="advert-banner__progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Navigation Controls */}
      {adverts.length > 1 && (
        <>
          {/* Navigation Arrows */}
          <button
            className="advert-banner__nav advert-banner__nav--prev"
            onClick={handlePrevious}
            disabled={isTransitioning}
            aria-label="Previous advert"
          >
            <MdChevronLeft />
          </button>

          <button
            className="advert-banner__nav advert-banner__nav--next"
            onClick={handleNext}
            disabled={isTransitioning}
            aria-label="Next advert"
          >
            <MdChevronRight />
          </button>

          {/* Navigation Dots */}
          <div className="advert-banner__dots">
            {adverts.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? "active" : ""}`}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                aria-label={`Go to advert ${index + 1}`}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="advert-banner__counter">
            {currentIndex + 1} / {adverts.length}
          </div>
        </>
      )}
    </div>
  );
}
