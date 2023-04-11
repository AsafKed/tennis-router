import React from "react";
import { Link } from "react-router-dom";

function WelcomePage() {
  return (
    <div>
      <h1>Welcome to the App</h1>
      <p>App description and instructions...</p>
      <Link to="/group">Go to Group Page</Link>
    </div>
  );
}

export default WelcomePage;
