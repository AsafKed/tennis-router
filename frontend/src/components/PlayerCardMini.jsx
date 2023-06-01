// PlayerCardMini.jsx
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const PlayerCardMini = ({ player }) => {
    return (
        <Card style={{ width: '200px', height: '200px', marginBottom: '20px' }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    Mini Player Card
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Player: {player.player2}
                </Typography>
            </CardContent>
        </Card>
    )
}

export default PlayerCardMini;
