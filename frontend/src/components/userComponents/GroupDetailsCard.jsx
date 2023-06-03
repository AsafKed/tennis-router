import React from "react";
import { Button, Card, CardContent, Divider, Typography } from "@material-ui/core";

const GroupCard = ({ group, onGroupClicked, onGroupLeave, users, expandedGroup }) => {
    const expanded = group.group_id === expandedGroup;

    const handleOpen = (event) => {
        event.stopPropagation();
        onGroupClicked(expanded ? null : group.group_id);
    };

    const handleLeaveGroup = (event) => {
        event.stopPropagation();
        onGroupLeave(group.group_id);
    };    

    return (
        <Card onClick={handleOpen} style={{ marginBottom: '2em' }}>
            <CardContent>
                <Typography variant="h6">{group.group_name}</Typography>
                {expanded && (
                    <>
                        <Divider />
                        <br />
                        <Typography><i>Use the following ID to invite others.</i></Typography>
                        <Typography>Id: {group.group_id}</Typography>
                        <Typography>
                            {/* created by */}
                            <br />
                            Users: {users && users.map((user) => user.name).join(", ")}
                            {/* Group days  */}
                        </Typography>
                        <br />
                        <Button variant="contained" color="secondary" onClick={handleLeaveGroup}>
                            Leave group
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default GroupCard;
