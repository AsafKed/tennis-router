import React, { useState, useEffect } from 'react';
import { Modal, Card, CardContent, Typography, Box, CircularProgress, CardMedia, Chip } from '@mui/material';
import ReactCountryFlag from "react-country-flag";
import LinearProgress from '@mui/material/LinearProgress';

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
            <Box sx={{ boxShadow: 24, width: '80vw', maxWidth: '500px' }}>
                <Card>
                    {loading ? (
                        <CircularProgress />
                    ) : (
                        playerData && (
                            <CardContent>
                                <Box display="flex" flexDirection="row">
                                    <Box width="50%" paddingRight="16px">
                                        <CardMedia
                                            component="img"
                                            image={playerData.image_url}
                                            alt={playerData.name}
                                            sx={{ objectFit: 'contain', maxHeight: '300px', marginBottom: '16px' }}
                                        />
                                        <Box display="flex" alignItems="center">
                                            <ReactCountryFlag
                                                countryCode={playerData.country_code}
                                                style={{
                                                    width: '2em',
                                                    height: '2em',
                                                    marginRight: '10px',
                                                }}
                                                svg
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {playerData.country}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {playerData.personality_long}
                                        </Typography>
                                    </Box>
                                    <Box width="50%">
                                        <Typography variant="h5" component="div" id="player-card-title">
                                            {playerData.name}
                                        </Typography>
                                        {/* Add more player data here */}
                                        <Typography variant="body2" color="text.secondary" id="player-card-description">
                                            Rank: {playerData.rank} <br/>
                                            Rank Level: {playerData.rank_level} <br/>
                                            Status: {playerData.status} <br/>
                                            Experience: {playerData.experience} <br/>
                                            Play Style: {playerData.play_style} <br/>
                                            Age: {playerData.age} <br/>
                                            Height: {playerData.height} <br/>
                                            Favorite Shot: {playerData.favorite_shot} <br/>
                                            Hand: {playerData.hand} <br/>
                                            Grass Advantage: {playerData.grass_advantage} <br/>
                                            Career High Rank: {playerData.career_high_rank} <br/>
                                            Years on Tour: {playerData.years_on_tour} <br/>
                                            Coach: {playerData.coach} <br/>
                                            Gender: {playerData.gender} <br/>
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box marginTop="16px">
                                    {playerData.personality_tags.map((tag, index) => (
                                        <Chip label={tag} key={index} style={{ marginRight: '8px', marginBottom: '8px' }} />
                                    ))}
                                </Box>
                            </CardContent>
                        )
                    )}
                </Card>
            </Box>
        </Modal>
    );
};

export default PlayerCard;
