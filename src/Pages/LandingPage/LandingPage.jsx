import React from "react";
import "./LandingPage.css";

const features = [
  {
    title: "Meal Calendar",
    description: "Plan breakfast, lunch, dinner, snacks, and drinks with ease!",
    icon: "📅",
  },
  {
    title: "Grocery List Automation",
    description: "Automatically generate grocery lists from your recipes.",
    icon: "🛒",
  },
  {
    title: "Reduce Food Waste",
    description: "Buy only what you need and save money on groceries.",
    icon: "🌱",
  },
  {
    title: "Add Other Items",
    description: "Include household essentials.",
    icon: "🧻",
  },
  {
    title: "Subscription",
    description: "Enjoy an ad-free interface with extra perks.",
    icon: "✨",
  },
  {
    title: "Quick Login",
    description: "Login with Google, Apple, or traditional email.",
    icon: "🔑",
  },
];

const LandingPage = () => {
  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Your Kitchen!</h1>
          <p>
            Create you weekly meal plan, generate your grocery list, and save
            time and money.
          </p>
          <div className="hero-buttons">
            <button className="primary-btn">Start Free Trial</button>
            <button className="secondary-btn">Learn More</button>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Features</h2>
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
