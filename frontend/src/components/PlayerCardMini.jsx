// PlayerCardMini.jsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const PlayerCardMini = ({ player }) => {
    // Get info on the player
    const [playerInfo, setPlayerInfo] = useState({});

    useEffect(() => {
        const fetchPlayerInfo = async () => {
            const response = await fetch(`/players/data/${player.player2}`);
            const text = await response.text();
            const data = JSON.parse(text);
            console.log(data);
            setPlayerInfo(data);
        };

        fetchPlayerInfo();
    }, [player.player2]);

    return (
        <Card style={{ width: '200px', height: '200px', marginBottom: '20px' }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    {player.player2}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Similarity: {Math.round(player.similarity*100)}%
                </Typography>
            </CardContent>
        </Card>
    )
}

export default PlayerCardMini;
