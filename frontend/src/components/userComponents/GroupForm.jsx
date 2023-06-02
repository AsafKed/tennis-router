import React, { useEffect, useState } from 'react';
import { Alert, Button, TextField } from '@mui/material';
import { v4 as uuid } from 'uuid';

function GroupForm({ socketInstance, userId }) {
    const [groupId, setGroupId] = useState("");
    const [groupName, setGroupName] = useState("");
    const [formType, setFormType] = useState(null);
    const [attemptingCreate, setAttemptingCreate] = useState(false);
    const [attemptingJoin, setAttemptingJoin] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleCreateGroup = () => {
        setAttemptingCreate(true);
        if (!groupName) {
            return;
        }
        const newGroupId = uuid();
        socketInstance.emit('create_group', { group_id: newGroupId, group_name: groupName, user_id: userId });
        setFormType(null);
    };

    const handleCancelCreateGroup = () => {
        setFormType(null);
        setAttemptingCreate(false);
    };

    const handleJoinGroup = () => {
        setAttemptingJoin(true);
        socketInstance.emit('join_group', { group_id: groupId, user_id: userId });
    };

    const handleCancelJoinGroup = () => {
        setFormType(null);
        setAttemptingJoin(false);
        setErrorMessage(null);
    };

    // Error handling from server
    useEffect(() => {
        if (attemptingJoin && socketInstance) {
            socketInstance.on('join_group_status', (data) => {
                if (data.error) {
                    setErrorMessage(data.error);
                }
                else if (data.success) {
                    setErrorMessage(null);
                    setAttemptingJoin(false);
                    setFormType(null);
                }
            });

            return () => {
                socketInstance.off('join_group_error');
            };
        }
    }, [socketInstance]);

    return (
        <div>
            {!formType && (
                <div>
                    <Button onClick={() => setFormType('create')}>Create Group</Button>
                    <Button onClick={() => setFormType('join')}>Join Group</Button>
                </div>
            )}
            {formType === 'create' && (
                <div>
                    <TextField
                        label="Group Name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />
                    <Button onClick={handleCreateGroup}>Confirm Create Group</Button>
                    <Button onClick={handleCancelCreateGroup}>Cancel Create Group</Button>
                </div>
            )}
            {(!groupName && attemptingCreate) && (
                <Alert severity="error">Group name is required</Alert>
            )}
            {formType === 'join' && (
                <div>
                    <TextField
                        label="Group ID"
                        value={groupId}
                        onChange={(e) => setGroupId(e.target.value.trim())}
                    />
                    <Button onClick={handleJoinGroup}>Join Group</Button>
                    <Button onClick={handleCancelJoinGroup}>Cancel Join Group</Button>
                </div>
            )}
            {errorMessage && (
                <Alert severity="error">{errorMessage}</Alert>
            )}
        </div>
    );
}

export default GroupForm;
