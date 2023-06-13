import React, { useState, useEffect } from 'react';

// Styling
import { Card, CardContent, Typography, Box, CircularProgress, CardMedia, Grid, Divider, Chip, Button, Collapse } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import ReactCountryFlag from "react-country-flag";

// Tracking
import { useTracking } from 'react-tracking';

const PlayerCard = React.forwardRef(({ playerName, handleClose }, ref) => {
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    // Tracking
    const { trackEvent } = useTracking();

    const handleExpandClick = () => {
        setExpanded(!expanded);
        trackEvent({ action: expanded ? 'player_card_hide_more_info' : 'player_card_show_more_info', player_name: playerName });
    };

    useEffect(() => {
        const fetchPlayerData = async () => {
            setLoading(true);
            const playerNameForURL = playerName.replace(/ /g, '_');
            // const storedPlayerData = localStorage.getItem(playerNameForURL);
            // if (!storedPlayerData) {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/players/data/${playerNameForURL}`);
                const text = await response.text();
                const data = JSON.parse(text);
                setPlayerData(data);
                // localStorage.setItem(playerNameForURL, JSON.stringify(data));
            // } else {
            //     setPlayerData(JSON.parse(storedPlayerData));
            // }
            setLoading(false);
        };

        if (playerName) {
            fetchPlayerData();
        }
    }, [playerName]);


    return (
        <Box sx={{ boxShadow: 24 }}>
            <Card>
                {loading ? (
                    <CircularProgress />
                ) : (
                    playerData && (
                        <Card sx={{ ':hover': { boxShadow: 20 } }}>
                            <CardContent>
                                <CardMedia
                                    component="img"
                                    height="300"
                                    image={playerData.image_url}
                                    alt={playerData.name}
                                    sx={{ objectFit: 'contain' }}
                                />
                                {/* Add box in the top right corner */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        m: 1,
                                        bgcolor: 'background.paper',
                                        color: 'text.primary',
                                        zIndex: 1,
                                    }}
                                >
                                    <IconButton
                                        aria-label="close"
                                        onClick={handleClose}
                                        sx={{ position: 'absolute', right: 8, top: 8 }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </Box>
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
    );
}
);

export default PlayerCard;
