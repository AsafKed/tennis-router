import React, { useState, useEffect } from 'react';
import { Modal, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';

const PlayerCard = ({ playerName, open, handleClose }) => {
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPlayerData = async () => {
            setLoading(true);
            const playerNameForURL = playerName.replace(/ /g, '_');
            const response = await fetch(`/players/data/${playerNameForURL}`);
            const text = await response.text();
            const data = JSON.parse(text);
            setPlayerData(data);
            setLoading(false);
        };

        if (playerName) {
            fetchPlayerData();
        }
    }, [playerName]);

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="player-card-title"
            aria-describedby="player-card-description"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box sx={{ boxShadow: 24 }}>
                <Card>
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        playerData && (
                            <CardContent>
                                <Typography variant="h5" component="div" id="player-card-title">
                                    {playerData.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" id="player-card-description">
                                    Country: {playerData.country} <br/>
                                    Rank: {playerData.rank} <br/>
                                    {/* Add more player data here */}
                                </Typography>
                            </CardContent>
                        )
                    )}
                </Card>
            </Box>
        </Modal>
    );
};

export default PlayerCard;
