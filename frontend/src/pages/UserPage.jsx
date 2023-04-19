import "../App.css";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase';
import { signOut } from "firebase/auth";

// Components
import UserPreferences from '../components/UserPreferences';


function UserPage() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);

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

  const getGroups = async (userId) => {
    const response = await fetch(`http://localhost:5001/user-groups/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log("Server response:", data);
    setGroups(data);
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        // ...
        console.log("uid", uid)
        getGroups(uid);
      } else {
        // User is signed out
        // ...
        console.log("user is logged out")
      }
    });

  }, [])

  return (
    <div>
      <h1>User</h1>
      <h3>Groups you're in</h3>
      <ul>
        {groups.map((group, ind) => (
          // TODO: add link to group page (should go to that group's page when clicked)
          <li key={ind}>{group.group_name}</li>
        ))}
      </ul>
      <button onClick={handleLogout}>Logout</button>
      <UserPreferences />
    </div>
  )
}

export default UserPage