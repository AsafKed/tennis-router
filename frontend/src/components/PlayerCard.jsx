import React, { useState, useEffect } from 'react';
import { Modal, Card, CardContent, Typography, Box, CircularProgress, CardMedia, Grid, LinearProgress, Chip } from '@mui/material';
import ReactCountryFlag from "react-country-flag";

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
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <CardMedia
                                            component="img"
                                            height="300"
                                            image={playerData.image_url}
                                            alt={playerData.name}
                                            sx={{ objectFit: 'contain' }}
                                        />
                                        <ReactCountryFlag
                                            countryCode={playerData.country_code}
                                            style={{
                                                width: '2em',
                                                height: '2em',
                                                position: 'absolute',
                                                top: '10px',
                                                left: '10px',
                                                zIndex: 1,
                                            }}
                                            svg
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            From: {playerData.country} <br/>
                                            {playerData.personality_long} <br/>
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h5" component="div" id="player-card-title">
                                            {playerData.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Rank: {playerData.rank} <br/>
                                            <LinearProgress variant="determinate" value={playerData.rank} /> {/* You need to normalize the rank value */}
                                            {/* Add more player data here */}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        {playerData.personality_tags.map((tag, index) => (
                                            <Chip label={tag} key={index} style={{marginRight: '5px', marginBottom: '5px'}}/>
                                        ))}
                                    </Grid>
                                </Grid>
                            </CardContent>
                        )
                    )}
                </Card>
            </Box>
        </Modal>
    );
};

export default PlayerCard;
