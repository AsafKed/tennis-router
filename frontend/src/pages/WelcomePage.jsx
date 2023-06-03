import React from "react";
import { Link } from "react-router-dom";

function WelcomePage() {
  return (
    // Add styling to the div. Make it look nice.
    <div style={{ width: "50%", textAlign: "left" }}>
      <h1>Welcome to the Match Recommender!</h1>
      <p>Browse the players and put in your preferences by clicking the tennis racket in the navigation bar.</p>
      <p>On that page, you can browse and like players. Head over there to experiment with it.</p>

      <p>We'll make recommendations for singles matches.</p>

      <p>We need to know which day you'll come and some more details to make a suitable recommendation. Head over to the settings page (rightmost in the navigation) to fill that in! Or click below.</p>
      <Link to="/user">Go to Profile</Link>
    </div>
  );
}

export default WelcomePage;
