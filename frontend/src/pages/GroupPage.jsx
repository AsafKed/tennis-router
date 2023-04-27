import "../App.css";
import Group from "../components/Group";
import UserList from "../components/UserList";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { Card, CardContent, Typography } from "@material-ui/core";

function GroupPage() {
  const [socketInstance, setSocketInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState("");
  const [leavingGroup, setLeavingGroup] = useState(false);
  const [user, setUser] = useState([]);
  const [groups, setGroups] = useState([]);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [expandedGroupUsers, setExpandedGroupUsers] = useState([]);

  const handleGroupSelected = (groupName) => {
    setGroup(groupName);
    getGroups(user.uid);
  };

  // TODO fix this functionality (currently not working)
  const handleGroupLeave = () => {
    setGroup("");
    setLeavingGroup(true);
    getGroups(user.uid);
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

  // To expand the group and show the users in the group
  const handleGroupClicked = async (groupId) => {
    setExpandedGroup(groupId);
    const response = await fetch(`http://localhost:5001/group-users/${groupId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log("Server response:", data);
    setExpandedGroupUsers(data);
  };

  useEffect(() => {
    onAuthStateChanged(auth, (new_user) => {
      if (new_user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        // TODO get request from backend to get the user
        const uid = new_user.uid;
        console.log("uid", uid)
        getUserDataFromServer(uid);
        getGroups(uid);
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
      <div>
      <h1>Groups you're in</h1>
        <div>
          {groups.map((group, ind) => (
            <Card
              key={ind}
              onClick={() => handleGroupClicked(group.group_id)}
              style={{ marginBottom: 10 }}
            >
              <CardContent>
                <Typography>{group.group_name}</Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div>
        <h1>Group Entry</h1>
        <div className="line">
          <Group onGroupSelected={handleGroupSelected} onGroupLeft={handleGroupLeave} user={user} />
        </div>
        {!loading && (
          <UserList
            socket={socketInstance}
            group={expandedGroup}
            user={user}
            leavingGroup={leavingGroup}
            users={expandedGroupUsers}
          />
        )}
      </div>
    </div>
  );
}

export default GroupPage;
