import React, { useState, useEffect } from 'react';
import { Modal, Card, CardContent, Typography, Box, CircularProgress, CardMedia } from '@mui/material';
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
                            <>
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
                                <CardContent>
                                    <Typography variant="h5" component="div" id="player-card-title">
                                        {playerData.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" id="player-card-description">
                                        Country: {playerData.country} <br/>
                                        Rank: {playerData.rank} <br/>
                                        Rank Level: {playerData.rank_level} <br/>
                                        Status: {playerData.status} <br/>
                                        Experience: {playerData.experience} <br/>
                                        Play Style: {playerData.play_style} <br/>
                                        Age: {playerData.age} <br/>
                                        Height: {playerData.height} <br/>
                                        Favorite Shot: {playerData.favorite_shot} <br/>
                                        Hand: {playerData.hand} <br/>
                                        Personality Tags: {playerData.personality_tags} <br/>
                                        Personality Long: {playerData.personality_long} <br/>
                                        Grass Advantage: {playerData.grass_advantage} <br/>
                                        Career High Rank: {playerData.career_high_rank} <br/>
                                        Years on Tour: {playerData.years_on_tour} <br/>
                                        Coach: {playerData.coach} <br/>
                                        Gender: {playerData.gender} <br/>
                                    </Typography>
                                </CardContent>
                            </>
                        )
                    )}
                </Card>
            </Box>
        </Modal>
    );
};

export default PlayerCard;
