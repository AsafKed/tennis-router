import React, { useState, useEffect } from 'react';
import { Modal, Card, CardContent, Typography, Box, CircularProgress, CardMedia, Grid, Divider, Chip } from '@mui/material';
import ReactCountryFlag from "react-country-flag";
import { Star, SportsTennis, CalendarToday } from '@mui/icons-material';

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
                            <Grid container>
                                <Grid item xs={12} md={6}>
                                    <CardMedia
                                        component="img"
                                        height="300"
                                        image={playerData.image_url}
                                        alt={playerData.name}
                                        sx={{ objectFit: 'contain' }}
                                    />
                                    <CardContent>
                                        <Typography variant="h4" component="div" id="player-card-title">
                                            {playerData.name}
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Card>
                                                    <CardContent>
                                                        <Typography variant="body2" color="text.secondary">
                                                            <ReactCountryFlag
                                                                countryCode={playerData.country_code}
                                                                style={{
                                                                    width: '1em',
                                                                    height: '1em',
                                                                }}
                                                                svg
                                                            /> {playerData.country}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Card>
                                                    <CardContent>
                                                        <Typography variant="h6" component="div">
                                                            <Star /> Rank: {playerData.rank}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            <SportsTennis /> Play Style: {playerData.play_style}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Card>
                                                    <CardContent>
                                                        <Typography variant="h6" component="div">
                                                            <Star /> Career High Rank: {playerData.career_high_rank}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            <CalendarToday /> Career High Year: {playerData.career_high_year}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        </Grid>
                                        <Typography variant="body2" color="text.secondary">
                                            {playerData.personality_long}
                                        </Typography>
                                    </CardContent>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <CardContent>
                                        <Typography variant="h5" component="div">
                                            More info
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Card>
                                                    <CardContent>
                                                        <Typography variant="h6" component="div">
                                                            <Star /> Rank: {playerData.rank}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            <SportsTennis /> Play Style: {playerData.play_style}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Card>
                                                    <CardContent>
                                                        <Typography variant="h6" component="div">
                                                            <Star /> Career High Rank: {playerData.career_high_rank}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            <CalendarToday /> Career High Year: {playerData.career_high_year}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        </Grid>
                                        <Divider />
                                        Rank Level: {playerData.rank_level} <br />
                                        Status: {playerData.status} <br />
                                        Experience: {playerData.experience} <br />
                                        Age: {playerData.age} <br />
                                        Height: {playerData.height} <br />
                                        Favorite Shot: {playerData.favorite_shot} <br />
                                        Hand: {playerData.hand} <br />
                                        Grass Advantage: {playerData.grass_advantage} <br />
                                        Years on Tour: {playerData.years_on_tour} <br />
                                        Coach: {playerData.coach} <br />
                                        Gender: {playerData.gender} <br />
                                    </CardContent>
                                </Grid>
                                <Grid item xs={12}>
                                    <CardContent>
                                        <Typography variant="h5" component="div">
                                            Personality Tags
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', '& > :not(style)': { m: 0.5 } }}>
                                            {playerData.personality_tags.map((tag) => (
                                                <Chip label={tag} key={tag} />
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Grid>
                            </Grid>
                        )
                    )}
                </Card>
            </Box>
        </Modal>
    );
};

export default PlayerCard;
