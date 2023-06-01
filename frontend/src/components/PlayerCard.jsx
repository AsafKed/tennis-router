import React, { useState, useEffect } from 'react';
import { Modal, Card, CardContent, Typography, Box, CircularProgress, CardMedia, Grid, Divider, Chip, Button, Collapse } from '@mui/material';
import ReactCountryFlag from "react-country-flag";
import { Star, SportsTennis, CalendarToday, ExpandMore } from '@mui/icons-material';

const PlayerCard = ({ playerName }) => {
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

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
        // <Modal
        //     open={open}
        //     onClose={handleClose}
        //     aria-labelledby="player-card-title"
        //     aria-describedby="player-card-description"
        //     style={{
        //         display: 'flex',
        //         alignItems: 'center',
        //         justifyContent: 'center',
        //     }}
        // >
        <Box sx={{ boxShadow: 24 }}>
            <Card>
                {loading ? (
                    <CircularProgress />
                ) : (
                    playerData && (
                        <Card>
                            <CardContent>
                                <CardMedia
                                    component="img"
                                    height="300"
                                    image={playerData.image_url}
                                    alt={playerData.name}
                                    sx={{ objectFit: 'contain' }}
                                />
                                <Box display="flex" alignContent={'center'} alignItems={'center'}>
                                    <Typography variant="h1" component="div">
                                        {playerData.rank}
                                    </Typography>
                                    <Typography variant="h4" component="div" id="player-card-title" padding={1}>
                                        Ranking
                                    </Typography>
                                </Box>
                                <CardContent>
                                    <Typography variant="h4" component="div" id="player-card-title">
                                        {playerData.name}
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Typography variant="body1" color="text.secondary">
                                                {playerData.country_code && (
                                                    <ReactCountryFlag
                                                        countryCode={playerData.country_code}
                                                        style={{
                                                            width: '1em',
                                                            height: '1em',
                                                            paddingRight: '0.5em',
                                                        }}
                                                        svg
                                                    />
                                                )}
                                                {playerData.country} | {playerData.play_style} | Career High Rank: {playerData.career_high_rank} in {playerData.career_high_year}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    <br />
                                    <Divider />
                                    <br />

                                    <Box paddingLeft={2}>
                                        <Typography variant="body1" color="text.secondary">
                                            {playerData.personality_long}
                                        </Typography>
                                    </Box>
                                    <Button variant="body2" onClick={handleExpandClick} endIcon={<ExpandMore />} >
                                        More info
                                    </Button>

                                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                                        <CardContent>
                                            <Typography variant="h5" component="div">
                                                Numeric Stats
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Age: {playerData.age} <br />
                                                Years on Tour: {playerData.years_on_tour} <br />
                                                Height: {playerData.height} <br /><br />
                                            </Typography>
                                            <Typography variant="h5" component="div">
                                                Categorical Stats
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {playerData.status && <span>Status: {playerData.status} <br /></span>}
                                                Favorite Shot: {playerData.favorite_shot} <br />
                                                Hand: {playerData.hand} <br />
                                                Grass Advantage: {playerData.grass_advantage} <br />
                                                Coach: {playerData.coach} <br />
                                            </Typography>
                                        </CardContent>
                                    </Collapse>

                                </CardContent>
                            </CardContent>

                            <Box paddingLeft={2}>
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
                            </Box>
                        </Card>
                    )
                )}
            </Card>
        </Box>
        // </Modal>
    );
};

export default PlayerCard;
