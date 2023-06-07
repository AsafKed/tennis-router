import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Button, Divider } from '@mui/material';
import InfoPopup from '../InfoPopup';

const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

export default function GroupDetailsCard({ group, handleLeaveGroup, handleDeleteGroup }) {
    const [expanded, setExpanded] = React.useState(false);
    const [users, setUsers] = React.useState([]);

    const handleExpandClick = async () => {
        if (!expanded) {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/group-users/${group.group_id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            setUsers(data);
        }
        setExpanded(!expanded);
    };

    return (
        <Card sx={{ maxWidth: 345, marginBlockEnd: '1rem' }}>
            <CardHeader
                action={
                    <ExpandMore onClick={handleExpandClick}>
                        <ExpandMoreIcon />
                    </ExpandMore>
                }
                title={group.group_name}
            />

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    {expanded && (
                        <>
                            <Divider />
                            <br />
                            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
                                <Typography><i>Use the following group ID to invite others.</i></Typography>
                                <InfoPopup infoText="Copy it and send it to them so they can join it in their own user page." />
                            </Box>
                            <Typography>{group.group_id}</Typography>
                            <br />
                            <br />
                            <Typography>
                                {/* created by */}
                                Users: {users && users.map((user) => user.name).join(", ")}
                                {/* Group days  */}
                            </Typography>
                            <br />
                            {group.created_by_user ? (
                                <Button variant="contained" color="secondary" onClick={() => handleDeleteGroup(group.group_id)}>
                                    Delete group
                                </Button>
                            ) : (
                                <Button variant="contained" color="secondary" onClick={() => handleLeaveGroup(group.group_id)}>
                                    Leave group
                                </Button>
                            )}
                        </>
                    )}
                </CardContent>
            </Collapse>
        </Card>
    );
}