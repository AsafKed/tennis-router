import "../App.css";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Divider, Typography, List, ListItem, ListItemButton, ListItemText, Badge } from '@mui/material';
import { styled } from '@mui/material/styles';
import GroupView from "../components/userComponents/GroupView";

// Firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase';
import { signOut } from "firebase/auth";

function UserPage() {
  const subPages = ["recommendations", "groups", "settings"];
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [groupNum, setGroupNum] = useState(0);

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      // Sign-out successful.
      navigate("/");
      console.log("Signed out successfully.");
    }).catch((error) => {
      // An error happened.
      console.log("Error signing out.");
    });
  }

  const getGroupNum = (uid) => {
    fetch(`http://localhost:5001/user-groups/${uid}`, {
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
    const response = await fetch(`http://localhost:5001/users/${userId}`, {
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
        console.log("user is logged out")
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
      <h1>Settings</h1>
      <h3>Welcome back, {name}.</h3>
      <Divider />
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedIndex === 0}
            onClick={(event) => handleListItemClick(event, 0)}
          >
            <ListItemText primary="Recommendations" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <StyledBadge badgeContent={groupNum} color="primary" showZero>
            <ListItemButton
              selected={selectedIndex === 1}
              onClick={(event) => handleListItemClick(event, 1)}
            >
              <ListItemText primary="Groups" secondary={
                <React.Fragment>
                  {" Click here to view/edit your groups."}
                </React.Fragment>
              }
              />
            </ListItemButton>
          </StyledBadge>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedIndex === 2}
            onClick={(event) => handleListItemClick(event, 2)}
          >
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>

      {selectedIndex === 1 && <GroupView userId={userId} />}

      <Button onClick={handleLogout}>Logout</Button>
    </div>
  )
}

export default UserPage