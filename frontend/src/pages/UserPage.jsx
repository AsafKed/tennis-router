import "../App.css";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Divider, Typography, List, ListItem, ListItemButton, ListItemText } from '@mui/material';

// Firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase';
import { signOut } from "firebase/auth";

function UserPage() {
  const subPages = ["recommendations", "groups", "saved settings"];
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  const getName = async (userId) => {
    const response = await fetch(`http://localhost:5001/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log("Server response:", data);
    setName(data.name);
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        getName(uid);
      } else {
        // User is signed out
        console.log("user is logged out")
      }
    });

  }, [])

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
          <ListItemButton
            selected={selectedIndex === 1}
            onClick={(event) => handleListItemClick(event, 1)}
          >
            <ListItemText primary="Groups" secondary={
              <React.Fragment>
                {" Click here to view/edit your groups."}
              </React.Fragment>
            } />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedIndex === 2}
            onClick={(event) => handleListItemClick(event, 2)}
          >
            <ListItemText primary="Saved Settings" />
          </ListItemButton>
        </ListItem>
      </List>

      <Button onClick={handleLogout}>Logout</Button>
    </div>
  )
}

export default UserPage