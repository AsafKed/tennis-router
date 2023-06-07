import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Typography } from "@mui/material";

// Tracking
import { dispatchTrackingData } from '../TrackingDispatcher';
import { track, useTracking } from 'react-tracking';

function WelcomePage() {
  const { trackEvent } = useTracking();

  // Upon opening the page
  useEffect(() => {
    trackEvent({ action: 'page_open' })
  }, []);

  return (
    // Add styling to the div. Make it look nice.
    <div style={{ maxWidth: "90%", textAlign: "left", flexGrow: 1, padding: "1rem", wordWrap: "break-word" }}>
      <Typography variant="h1">Welcome to the Match Recommender!</Typography>
      <Typography variant="h2">What is this?</Typography>
      <p>This is a tool to help you find a suitable tennis match.</p>
      <p>Explore with it.</p>

      <Typography variant="h2">How does it work?</Typography>
      <p>Check out the players in the browse page.</p>

      <Typography variant="h2">How do I get recommendations?</Typography>
      <p>Navigate to the user page.</p>
      <p>In Settings, specify which days you'll come.</p>
      <p>In Groups, join or create a group, if you plan to come with one.</p>



      <Typography variant="h2">More info</Typography>
      <p>We'll make recommendations for singles matches.</p>
      <p>This tool is created by Asaf Kedem for his Master thesis at the Jheronimus Academy of Data Science, to be used at the Libema Open.</p>
      <p>The goal is to research group recommendations in a real-life context.</p>
      <p>For more information, contact Asaf at <a href="mailto:a.kedem@tilburguniversity.edu">a.kedem@tilburguniversity.edu</a>.</p>

    </div>
  );
}

export default track({ page: 'Home' }, { dispatch: dispatchTrackingData })(WelcomePage);
