import "../App.css";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Divider, Typography, List, ListItem, ListItemButton, ListItemText, Badge } from '@mui/material';
import { styled } from '@mui/material/styles';
import RecommendationsView from "../components/userComponents/RecommendationsView";
import GroupView from "../components/userComponents/GroupView";
import SettingsView from "../components/userComponents/SettingsView";

// Firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase';
import { signOut } from "firebase/auth";

// Tracking
import { dispatchTrackingData } from '../TrackingDispatcher';
import { track, useTracking } from 'react-tracking';

function UserPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [groupNum, setGroupNum] = useState(0);

  const listItems = [{ view: 'Recommendations', component: <RecommendationsView userId={userId} /> },
  { view: 'Groups', component: <GroupView userId={userId} /> },
  { view: 'Settings', component: <SettingsView userId={userId} /> }]

  // Tracking
  const { trackEvent } = useTracking();

  // Upon opening the page
  useEffect(() => {
    trackEvent({ action: 'page_open' })
  }, []);

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
    trackEvent({ action: 'tab_open', tab: listItems[index].view })
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      // Sign-out successful.
      navigate("/");
      // console.log("Signed out successfully.");
    }).catch((error) => {
      // An error happened.
      // console.log("Error signing out.");
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
        // console.log("user is logged out")
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
    <div>
      <h1>User Page</h1>
      <h3>Welcome back, {name}.</h3>
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
          <Badge badgeContent={groupNum} color="primary" style={{ width: '100%' }} anchorOrigin={{ vertical: 'top', horizontal: 'left' }} showZero>
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
                {"Fill these in to get recommendations."}
              </React.Fragment>
            } />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Render the selected component */}
      {listItems[selectedIndex].component}

      <Button onClick={handleLogout}>Logout</Button>
    </div>
  )
}

export default track({ page: 'User' }, { dispatch: dispatchTrackingData })(UserPage);