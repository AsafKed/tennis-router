import "../App.css";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Firebase
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase';
import { signOut } from "firebase/auth";

function UserPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");

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
        console.log("uid", uid)
        getName(uid);
      } else {
        // User is signed out
        console.log("user is logged out")
      }
    });

  }, [])

  return (
    <div>
      <h1>User</h1>
      <h2>Name: {name}</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default UserPage