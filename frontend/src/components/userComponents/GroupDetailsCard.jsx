import React from "react";
import { Button, Card, CardContent, Divider, Typography } from "@material-ui/core";

// Tracking
import { dispatchTrackingData } from "../../TrackingDispatcher";
import { track, useTracking } from 'react-tracking';

const GroupCard = ({ group, onGroupClicked, onGroupLeave, onDeleteGroup, users, expandedGroup }) => {
    const expanded = group.group_id === expandedGroup;

    const { trackEvent } = useTracking();

    const handleOpen = (event) => {
        event.stopPropagation();
        onGroupClicked(expanded ? null : group.group_id);

        trackEvent({ action: expanded ? 'group_closed' : 'group_opened', 'group_id': group.group_id })
    };

    const handleLeaveGroup = (event) => {
        event.stopPropagation();
        onGroupLeave(group.group_id);
    };

    const handleDeleteGroup = (event) => {
        event.stopPropagation();
        onDeleteGroup(group.group_id);
    };

    return (
        <Card style={{ marginBottom: '2em' }}>
            <CardContent>
                <Typography onClick={handleOpen} variant="h6">{group.group_name}</Typography>
                {expanded && (
                    <>
                        <Divider />
                        <br />
                        <Typography><i>Use the following ID to invite others.</i></Typography>
                        <Typography>{group.group_id}</Typography>
                        <Typography>
                            {/* created by */}
                            <br />
                            Users: {users && users.map((user) => user.name).join(", ")}
                            {/* Group days  */}
                        </Typography>
                        <br />
                        {group.created_by_user ? (
                            <Button variant="contained" color="secondary" onClick={handleDeleteGroup}>
                                Delete group
                            </Button>
                        ) : (
                            <Button variant="contained" color="secondary" onClick={handleLeaveGroup}>
                                Leave group
                            </Button>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default track({dispatch: dispatchTrackingData})(GroupCard);
