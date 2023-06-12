import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Divider, Paper, Typography } from "@mui/material";

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
      <Typography variant="h4">Welcome to the Match Recommender!</Typography>

      <br />
      <br />

      <Paper style={{ padding: "1rem", }}>
        <Typography variant="h5">Explore players</Typography>
        <Typography variant="body1">
          Explore by <a href="/browser/player">players' similarities to other players</a> or by <a href="/browser/parameter">player characteristics</a>.
          {/* the list of players participating in the Libema-
        open tournament. Click the racket icon to open the player browser. When clicking a player,
        you will get to see several player characteristics such as play style and personality. You can
        also view similar players. */}
        </Typography>
      </Paper>

      <br />
      <br />
      <Paper style={{ padding: "1rem", }}>
        <Typography variant="h5">Match recommendations</Typography>
        <Typography variant="body1">
          If you <a href="/register">register</a> for our system with your email address, we'll recommend you today's matches based on your player preferences.

          {/* We offer more functionality if you <a href="/register">register</a> for our system with your email address. An
        account will be created and the browser tool will allow you to indicate your player
        preferences. It will show you player recommendations based on the player characteristics
        you select or the players you mark with a like.
        If you are visiting the tournament, we can provide you with a schedule with recommended
        matches to watch on the day of your visit. On the user page you can indicate which days you
        are visiting the tournament. The evening before each day we will email you a schedule as
        well. The day after your visit we will send you a short survey about our system. */}
        </Typography>
      </Paper>

      <br />
      <br />

      <Paper style={{ padding: "1rem", }}>
        <Typography variant="h5">Match recommendations – for groups!</Typography>
        <Typography variant="body1">
          If you visit the tournament with a group (2 people or more), and you all register, we recommend you matches taking all your registered group members' preferences into account! After login, access groups on the <a href="/user/groups">user page</a>.

          {/* each group member can register
        and indicate their preferences. One member ca create a group and share the link with the
        other members. Our system will then recommend you what matches to watch that fit the
        preferences of the group best. */}
        </Typography>
      </Paper>

      <br />
      <br />

      <Divider style={{ marginTop: "1rem", marginBottom: "1rem" }} />
      <Typography variant="caption">
        This tool is created by Asaf Kedem for his Master thesis at the <a href="https://www.jads.nl/" target="_blank">Jheronimus Academy of Data Science (JADS)</a>, to be used
        at the <a href="https://libema-open.nl/" target="_blank">Libéma Open</a>. The goal is to research group recommendations in a real-life context.
        For more information, contact Asaf at <a href="mailto:a.kedem@tilburguniversity.edu" target="_blank">a.kedem@tilburguniversity.edu</a>.
      </Typography>
      <br />
      <br />


      {/* Display the logos below the text, centered */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "1rem" }}>
        <img src={`${process.env.PUBLIC_URL}/JADS_logo_RGB.ico`} alt="JADS logo" style={{ width: "150px", height: "auto" }} />
        <img src={`${process.env.PUBLIC_URL}/libemaopen-logo.png`} alt="Libema logo" style={{ width: "150px", height: "auto" }} />
      </div>

    </div>
  );
}

export default track({ page: 'Home' }, { dispatch: dispatchTrackingData })(WelcomePage);
