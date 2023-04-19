import "../App.css";
import Group from "../components/Group";
import UserList from "../components/UserList";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

function GroupPage() {
  const [socketInstance, setSocketInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState("");
  const [leavingGroup, setLeavingGroup] = useState(false);
  const [userName, setUserName] = useState("");
  const [user, setUser] = useState([]);

  const handleGroupSelected = (groupName, userName) => {
    setGroup(groupName);
    setUserName(userName);
  };

  const handleGroupLeave = () => {
    setGroup("");
    setLeavingGroup(true);
  };

  useEffect(() => {
    if (leavingGroup && socketInstance) {
      socketInstance.on("update_group_users", (users) => {
        console.log("users", users);
        setLeavingGroup(false);
        window.location.reload(false);
      });     
    }
  }, [leavingGroup, socketInstance]);

  const getUserDataFromServer = async (userId) => {
    const response = await fetch(`http://localhost:5001/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    setUser(data);
    console.log("Server response:", data);
  };
      
  useEffect(()=>{
    onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          // TODO get request from backend to get the user
          const uid = user.uid;
          getUserDataFromServer(uid);
          console.log("uid", uid)
        } else {
          // User is signed out
          // ...
          console.log("user is logged out")
        }
      });
     
}, [])

  // Connection to socket
  useEffect(() => {
    if (!socketInstance) {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";
      const socket = io(backendUrl, {
        transports: ["websocket"],
        cors: {
          origin: "http://localhost:3000/",
        },
      });

      setSocketInstance(socket);

      socket.on("connect", (data) => {
        console.log(data);
      });

      socket.on("disconnect", (data) => {
        console.log(data);
      });
    }
  }, [socketInstance]);

  useEffect(() => {
    if (group && socketInstance) {
      setLoading(false);
    }
  }, [group, socketInstance]);

  return (
    <div>
      <h1>Group Entry</h1>
      <div className="line">
        <Group onGroupSelected={handleGroupSelected} onGroupLeft={handleGroupLeave} user={user} />
      </div>
      {!loading && <UserList socket={socketInstance} group={group} user={user} leavingGroup={leavingGroup} />}
    </div>
  );
}

export default GroupPage;
