import React, { useState, useEffect } from 'react';
import GroupForm from "./GroupForm";
import GroupDetailsCard from "./GroupDetailsCard";
import UserList from "../UserList";
import { io } from "socket.io-client";
import { Box } from '@mui/material';

// Tracking
import { dispatchTrackingData } from '../../TrackingDispatcher';
import { track, useTracking } from 'react-tracking';
import InfoPopup from '../InfoPopup';

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

    // To get the groups that the user is in
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

    useEffect(() => {
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
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <h1>Groups</h1>
                    <InfoPopup infoText="you can create a new group and ask other people to join the group by sending them
                a link with an access code. The recommendations for which matches to watch will then take
                into account the group you are in. Our recommender will try to schedule matches in such a
                way that it satisfies the preferences in the group as much as possible." />
                </Box>
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
                    <GroupForm socketInstance={socketInstance} userId={userId} getGroups={getGroups} />
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
