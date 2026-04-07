// ================================================================
// CREATE: frontend/src/pages/landing/LandingPage.js
// ================================================================
// Professional landing page with hero, features, pricing, CTA
// ================================================================

import React from "react";
import { Link } from "react-router-dom";
import {
  MdPeople,
  MdHowToVote,
  MdAccountBalance,
  MdNotifications,
  MdSecurity,
  //   MdSpeed,
  MdDevices,
  MdCheckCircle,
  MdArrowForward,
  MdBusiness,
} from "react-icons/md";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav__container">
          <div className="landing-nav__logo">
            <MdBusiness className="landing-nav__logo-icon" />
            <span>AGMS</span>
          </div>
          <div className="landing-nav__links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <Link to="/login" className="landing-nav__login">
              Login
            </Link>
            <Link to="/register" className="landing-nav__cta">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero__container">
          <div className="landing-hero__content">
            <h1 className="landing-hero__title">
              Manage Your Association/Group
              <span className="landing-hero__title-highlight">
                {" "}
                Effortlessly
              </span>
            </h1>
            <p className="landing-hero__subtitle">
              Complete association management platform with member tracking,
              elections, financial management, and real-time notifications.
              Everything you need in one place.
            </p>
            <div className="landing-hero__buttons">
              <Link to="/register" className="landing-btn landing-btn--primary">
                Create Your Association
                <MdArrowForward />
              </Link>
              <Link
                to="/member-login"
                className="landing-btn landing-btn--outline"
              >
                Member Login
              </Link>
            </div>
            <div className="landing-hero__stats">
              <div className="landing-hero__stat">
                <div className="landing-hero__stat-number">500+</div>
                <div className="landing-hero__stat-label">Associations</div>
              </div>
              <div className="landing-hero__stat">
                <div className="landing-hero__stat-number">10K+</div>
                <div className="landing-hero__stat-label">Members</div>
              </div>
              <div className="landing-hero__stat">
                <div className="landing-hero__stat-number">99.9%</div>
                <div className="landing-hero__stat-label">Uptime</div>
              </div>
            </div>
          </div>
          <div className="landing-hero__image">
            <div className="landing-hero__mockup">
              <div className="landing-mockup">
                {/* Decorative mockup */}
                <div className="landing-mockup__window">
                  <div className="landing-mockup__header">
                    <div className="landing-mockup__dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  <div className="landing-mockup__content">
                    <div className="landing-mockup__card">
                      <div className="landing-mockup__card-header"></div>
                      <div className="landing-mockup__card-body">
                        <div className="landing-mockup__line"></div>
                        <div className="landing-mockup__line"></div>
                        <div className="landing-mockup__line short"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features" id="features">
        <div className="landing-container">
          <div className="landing-section-header">
            <h2 className="landing-section-title">Everything You Need</h2>
            <p className="landing-section-subtitle">
              Powerful features to manage every aspect of your association
            </p>
          </div>
          <div className="landing-features__grid">
            <FeatureCard
              icon={<MdPeople />}
              title="Member Management"
              description="Track members, manage profiles, add new member, and organize your entire membership database effortlessly."
              color="#00c896"
            />
            <FeatureCard
              icon={<MdHowToVote />}
              title="Elections & Voting"
              description="Conduct transparent elections, manage candidates, enable secure voting, and announce results in real-time."
              color="#4F46E5"
            />
            <FeatureCard
              icon={<MdAccountBalance />}
              title="Financial Management"
              description="Track dues, levies, donations, and expenses. Generate financial reports and manage payments seamlessly."
              color="#F59E0B"
            />
            <FeatureCard
              icon={<MdNotifications />}
              title="Notifications"
              description="Send instant notifications to members, announce events, share updates, and keep everyone informed."
              color="#EF4444"
            />
            <FeatureCard
              icon={<MdSecurity />}
              title="Secure & Private"
              description="Bank-level security, role-based access control, and data encryption to keep your information safe."
              color="#8B5CF6"
            />
            <FeatureCard
              icon={<MdDevices />}
              title="Multi-Platform"
              description="Access from web, iOS, and Android. Work from anywhere, on any device, anytime."
              color="#10B981"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-how" id="how-it-works">
        <div className="landing-container">
          <div className="landing-section-header">
            <h2 className="landing-section-title">How It Works</h2>
            <p className="landing-section-subtitle">
              Get started in 3 simple steps
            </p>
          </div>
          <div className="landing-how__steps">
            <Step
              number="1"
              title="Create Your Association"
              description="Sign up as a superadmin and set up your association profile in minutes."
            />
            <Step
              number="2"
              title="Invite Members"
              description="Add members, assign roles, and customize permissions based on your needs."
            />
            <Step
              number="3"
              title="Start Managing"
              description="Manage members, conduct elections, track finances, and send notifications - all in one place."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="landing-pricing" id="pricing">
        <div className="landing-container">
          <div className="landing-section-header">
            <h2 className="landing-section-title">
              Simple, Transparent Pricing
            </h2>
            <p className="landing-section-subtitle">
              Choose the plan that fits your association
            </p>
          </div>
          <div className="landing-pricing__grid">
            <PricingCard
              name="Starter"
              bonus="1st 2 months Free"
              price="N5000"
              period="Monthly"
              features={[
                "Up to 100 members",
                "Basic member management",
                "Elections & voting",
                "Financial tracking",
                // "Email notifications",
                "Community support",
              ]}
              cta="Get Started Free"
              link="/register"
            />
            <PricingCard
              name="Professional"
              bonus="1st 2 months Free"
              price="N10,000"
              period="per month"
              features={[
                "Up to 200 members",
                "Everything in Starter",
                // "Custom branding",
                "Advanced reports",
                // "SMS notifications",
                "Priority support",
                "Data export",
              ]}
              cta="Start Free Trial"
              link="/register"
              popular={true}
            />
            <PricingCard
              name="Enterprise"
              price="N20,000"
              period="per month"
              features={[
                "Unlimited members",
                "Everything in Professional",
                "White-label solution",
                "Custom integrations",
                "Dedicated support",
                "99.9% SLA",
                "Custom features",
              ]}
              cta="Contact Sales"
              link="/register"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="landing-container">
          <div className="landing-cta__content">
            <h2 className="landing-cta__title">
              Ready to Transform Your Association Management?
            </h2>
            <p className="landing-cta__subtitle">
              Join hundreds of associations already using AGMS to streamline
              their operations.
            </p>
            <div className="landing-cta__buttons">
              <Link
                to="/register"
                className="landing-btn landing-btn--primary landing-btn--lg"
              >
                Get Started Free
                <MdArrowForward />
              </Link>
              <Link
                to="/login"
                className="landing-btn landing-btn--outline landing-btn--lg"
              >
                Login to Your Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer__content">
            <div className="landing-footer__brand">
              <div className="landing-footer__logo">
                <MdBusiness />
                <span>AGMS</span>
              </div>
              <p className="landing-footer__tagline">
                Modern association management made simple.
              </p>
            </div>
            <div className="landing-footer__links">
              <div className="landing-footer__column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#how-it-works">How It Works</a>
              </div>
              {/* <div className="landing-footer__column">
                <h4>Company</h4>
                <Link to="/about">About Us</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/careers">Careers</Link>
              </div>
              <div className="landing-footer__column">
                <h4>Legal</h4>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms of Service</Link>
                <Link to="/cookies">Cookie Policy</Link>
              </div> */}
            </div>
          </div>
          <div className="landing-footer__bottom">
            <p>
              &copy; 2024 AGMS. All rights reserved. Project Next Consulting
              Nigeria{" "}
            </p>
            <p>info@pncnigeria.org; Tel: 07089637195 </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description, color }) {
  return (
    <div className="landing-feature-card">
      <div
        className="landing-feature-card__icon"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <h3 className="landing-feature-card__title">{title}</h3>
      <p className="landing-feature-card__description">{description}</p>
    </div>
  );
}

// Step Component
function Step({ number, title, description }) {
  return (
    <div className="landing-step">
      <div className="landing-step__number">{number}</div>
      <h3 className="landing-step__title">{title}</h3>
      <p className="landing-step__description">{description}</p>
    </div>
  );
}

// Pricing Card Component
function PricingCard({
  name,
  bonus,
  price,
  period,
  features,
  cta,
  link,
  popular,
}) {
  return (
    <div
      className={`landing-pricing-card ${popular ? "landing-pricing-card--popular" : ""}`}
    >
      {popular && (
        <div className="landing-pricing-card__badge">Most Popular</div>
      )}
      <div className="landing-pricing-card__header">
        <h3 className="landing-pricing-card__name">{name}</h3>
        {bonus && <div className="landing-pricing-card__bonus">{bonus}</div>}
        <div className="landing-pricing-card__price">
          <span className="landing-pricing-card__price-amount">{price}</span>
          <span className="landing-pricing-card__price-period">/{period}</span>
        </div>
      </div>
      <ul className="landing-pricing-card__features">
        {features.map((feature, index) => (
          <li key={index}>
            <MdCheckCircle />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        to={link}
        className={`landing-btn ${popular ? "landing-btn--primary" : "landing-btn--outline"} landing-btn--block`}
      >
        {cta}
      </Link>
    </div>
  );
}
