import React from "react";
import { Card, CardContent, Typography } from "@material-ui/core";

const GroupCard = ({ group, onGroupClicked, users, expandedGroup }) => {
    const expanded = group.group_id === expandedGroup;

    const handleClick = (event) => {
        event.stopPropagation();
        onGroupClicked(expanded ? null : group.group_id);
    };

    return (
        <Card onClick={handleClick} style={{ marginBottom: 10 }}>
            <CardContent>
                <Typography variant="h6">{group.group_name}</Typography>
                {expanded && (
                    <>
                        <Typography>Id: {group.group_id}</Typography>
                        <Typography>
                            Users: {users && users.map((user) => user.name).join(", ")}
                        </Typography>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default GroupCard;
