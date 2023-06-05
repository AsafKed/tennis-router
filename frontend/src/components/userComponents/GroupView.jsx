import React, { useState, useEffect } from 'react';
import GroupForm from "./GroupForm";
import GroupDetailsCard from "./GroupDetailsCard";
import UserList from "../UserList";
import { io } from "socket.io-client";

// Tracking
import { dispatchTrackingData } from '../../TrackingDispatcher';
import { track, useTracking } from 'react-tracking';

function GroupView({ userId }) {
    const [socketInstance, setSocketInstance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState("");
    const [leavingGroup, setLeavingGroup] = useState(false);
    const [groups, setGroups] = useState([]);
    const [expandedGroup, setExpandedGroup] = useState(null);
    const [expandedGroupUsers, setExpandedGroupUsers] = useState([]);

    const { trackEvent } = useTracking();

    // When the page is clicked, collapse the card
    const handlePageClick = () => {
        setExpandedGroup(null);
        setExpandedGroupUsers([]);
    };

    useEffect(() => {
        if (leavingGroup && socketInstance) {
            socketInstance.on("update_group_users", (users) => {
                // console.log("users", users);
                setLeavingGroup(false);
                window.location.reload(false);
            });
        }
    }, [leavingGroup, socketInstance]);

    useEffect(() => {
        const getGroups = async (userId) => {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user-groups/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            // console.log("Server response:", data);
            setGroups(data);
            trackEvent({ action: 'get_groups' })
        };
        getGroups(userId);
    }, [userId]);


    // To expand the group and show the users in the group
    const handleGroupClicked = async (groupId) => {
        if (expandedGroup !== groupId) {
            setExpandedGroup(groupId);
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/group-users/${groupId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            // console.log("Server response:", data);
            setExpandedGroupUsers(data);
        } else {
            setExpandedGroup(null);
            setExpandedGroupUsers([]);
        }
    };

    const handleGroupLeave = (groupId) => {
        if (socketInstance) {
            socketInstance.emit("leave_group", { group_id: groupId, user: { user_id: userId } });
        }
    };

    const handleDeleteGroup = async (groupId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/groups/${groupId}/delete?user_id=${userId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

        } catch (error) {
            console.error("Error deleting group: ", error);
        }
    };


    // Connection to socket
    useEffect(() => {
        if (!socketInstance) {
            const backendUrl = process.env.REACT_APP_BACKEND_URL;
            const socket = io(backendUrl, {
                transports: ["websocket"],
                cors: {
                    origin: "http://localhost:3000/",
                },
            });

            setSocketInstance(socket);

            socket.on("connect", (data) => {
                // console.log(data);
            });

            socket.on("disconnect", (data) => {
                // console.log(data);
            });
        }
    }, [socketInstance]);

    useEffect(() => {
        if (group && socketInstance) {
            setLoading(false);
        }
    }, [group, socketInstance]);
    return (
        <div onClick={handlePageClick}>
            <div>
                <h1>Groups</h1>
                <div>
                    {groups.map((group, ind) => (
                        <GroupDetailsCard
                            key={ind}
                            group={group}
                            onGroupClicked={handleGroupClicked}
                            onGroupLeave={handleGroupLeave}
                            onDeleteGroup={handleDeleteGroup}
                            users={expandedGroupUsers}
                            expandedGroup={expandedGroup}
                        />
                    ))}
                </div>
            </div>
            <div>
                <div className="line">
                    <GroupForm socketInstance={socketInstance} userId={userId} />
                </div>
                {!loading && (
                    <UserList
                        socket={socketInstance}
                        group={expandedGroup}
                        user={userId}
                        leavingGroup={leavingGroup}
                        users={expandedGroupUsers}
                    />
                )}
            </div>
        </div>
    );
}

export default track({ dispatch: dispatchTrackingData })(GroupView);
