import "../App.css";
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Divider, List, ListItem, ListItemButton, ListItemText, Badge, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import RecommendationsView from "../components/userComponents/RecommendationsView";
import GroupView from "../components/userComponents/GroupView";
import SettingsView from "../components/userComponents/SettingsView";
import InfoPopup from "../components/InfoPopup";

// Firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase';
import { signOut } from "firebase/auth";

// Tracking
import { dispatchTrackingData } from '../TrackingDispatcher';
import { track, useTracking } from 'react-tracking';

function UserPage() {
  const navigate = useNavigate();
  const params = useParams();
  const tab = params.tab;
  const tabNames = ['recommendations', 'groups', 'days'];

  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [groupNum, setGroupNum] = useState(0);

  const [gettingName, setGettingName] = useState(true);
  const [gettingGroupNum, setGettingGroupNum] = useState(true);

  const listItems = [{ view: 'Recommendations', component: <RecommendationsView userId={userId} /> },
  { view: 'Groups', component: <GroupView userId={userId} /> },
  { view: 'Days', component: <SettingsView userId={userId} /> }]

  // Tracking
  const { trackEvent } = useTracking();

  // Upon opening the page
  useEffect(() => {
    const index = tabNames.indexOf(tab);
    if (index !== -1) {
      setSelectedIndex(index);
    }
    trackEvent({ action: 'page_open' })
  }, [tab]);

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
    trackEvent({ action: 'tab_open', tab: listItems[index].view })
    navigate(`/user/${listItems[index].view.toLowerCase()}`);
  };

  const handleLogout = () => {
    trackEvent({ action: 'logout' })
    signOut(auth).then(() => {
      // Sign-out successful.
      navigate("/");
    }).catch((error) => {
      // An error happened.
    });
  }

  const getGroupNum = (uid) => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/user-groups/${uid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setGroupNum(data.length);
      });
    setGettingGroupNum(false);
  };

  const getName = async (userId) => {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    setUserId(data.user_id);
    setName(data.name);
    setGettingName(false);
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        getName(uid);
        getGroupNum(uid);
      } else {
        // User is signed out
      }
    });

  }, [])

  const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      right: 175,
      top: 25,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
    },
  }));

  return (
    <Box sx={{ flexGrow: 1, minWidth: 400, margin: 'auto', minHeight: 1000, padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1>User Page</h1>
        <InfoPopup infoText="On this page you create and join groups and indicate which days you plan to visit the
tournament. You can also view the recommended matches for the next day (when available)" />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 2 }}>

        <Typography variant="h3">Welcome back,
          {gettingName ? <CircularProgress /> : name}
        </Typography>

        <Button onClick={handleLogout}
          variant="outlined"
          color="secondary"
          sx={{ marginLeft: 2 }}>
          Logout
        </Button>

      </Box>
      <Divider />
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <ListItem disablePadding style={{ paddingBlockEnd: '0.5em' }}>
          <ListItemButton
            selected={selectedIndex === 0}
            onClick={(event) => handleListItemClick(event, 0)}
          >
            <ListItemText primary={listItems[0].view} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding style={{ paddingBlockEnd: '0.5em' }}>
          <Badge badgeContent={gettingGroupNum ? <CircularProgress size={20}/> : groupNum} color="primary" style={{ width: '100%' }} anchorOrigin={{ vertical: 'top', horizontal: 'left' }} showZero>
            <ListItemButton
              selected={selectedIndex === 1}
              onClick={(event) => handleListItemClick(event, 1)}
            >
              <ListItemText primary={listItems[1].view} secondary={
                <React.Fragment>
                  {" Click here to view/edit your groups."}
                </React.Fragment>
              }
              />
            </ListItemButton>
          </Badge>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedIndex === 2}
            onClick={(event) => handleListItemClick(event, 2)}
          >
            <ListItemText primary={listItems[2].view} secondary={
              <React.Fragment>
                {"Fill in the days you're attending to get recommendations."}
              </React.Fragment>
            } />
          </ListItemButton>
        </ListItem>
      </List>

      <br />

      {/* Render the selected component */}
      {listItems[selectedIndex].component}

    </Box>
  )
}

export default track({ page: 'User' }, { dispatch: dispatchTrackingData })(UserPage);