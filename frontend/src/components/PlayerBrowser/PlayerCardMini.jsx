import React, { useEffect, useState } from 'react';
// Styling
import { Card, CardContent, Typography, Select, MenuItem, CardMedia, Divider, CardHeader, Box, CircularProgress } from '@mui/material';
import Chip from '@mui/material/Chip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import ReactCountryFlag from "react-country-flag";

// Tracking
import { track, useTracking } from 'react-tracking';
import { dispatchTrackingData } from '../../TrackingDispatcher';

const PlayerCardMini = ({ player }) => {
    // Get info on the player
    const [playerInfo, setPlayerInfo] = useState({});
    const [dataType, setDataType] = useState('description');
    const [loading, setLoading] = useState(false);

    // Tracking
    const { trackEvent } = useTracking();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchPlayerInfo = async () => {
            setLoading(true);
            // const storedPlayerInfo = localStorage.getItem(player.player2);
            // if (!storedPlayerInfo) {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/players/data/${player.player2}`);
                const text = await response.text();
                const data = JSON.parse(text);
                setPlayerInfo(data);
                // localStorage.setItem(player.player2, JSON.stringify(data));
            // } else {
            //     setPlayerInfo(JSON.parse(storedPlayerInfo));
            // }
            setLoading(false);
        };

        fetchPlayerInfo();
    }, [player.player2]);


    const handleDataTypeChange = (event) => {
        setDataType(event.target.value);
    };

    const handlePlayerClick = () => {
        trackEvent({ action: 'click_player_card_mini', from: player.player1, to: player.player2, similarity_weight: player.similarity });
        // // Slight delay
        // Replace spaces with underscores
        return player.player2.replace(/ /g, '_');
    };

    return (
        <Card style={{ width: isMobile ? '90vw' : '33vw', height: 'auto', marginBottom: '20px' }}>
            {loading && (<CircularProgress />)}
            <CardHeader title={player.player2} subheader={Math.round(player.similarity * 100) + "% similar to " + player.player1}
                action={
                    <IconButton aria-label="settings" href={handlePlayerClick()}>
                        <OpenInNewIcon />
                    </IconButton>
                } />
            {playerInfo.image_url &&
                <CardMedia
                    component="img"
                    image={playerInfo.image_url}
                    alt={playerInfo.name}
                    sx={{ padding: '1rem', }}>
                </CardMedia>
            }
            <Divider />
            <CardContent style={{ padding: '20px' }}>
                {playerInfo.country_code && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ReactCountryFlag
                            countryCode={playerInfo.country_code}
                            style={{
                                width: '1em',
                                height: '1em',
                                paddingRight: '0.5em',
                            }}
                            svg
                        />
                        <Typography variant="body2">{playerInfo.country}</Typography>
                    </Box>
                )}
                <Select
                    value={dataType}
                    onChange={handleDataTypeChange}
                    variant="outlined"
                    style={{ marginTop: '10px', marginBottom: '10px' }}
                >
                    <MenuItem value="description">Description</MenuItem>
                    <MenuItem value="personality_tags">Personality Tags</MenuItem>
                    <MenuItem value="numeric">Numeric Stats</MenuItem>
                    <MenuItem value="categorical">Categorical Stats</MenuItem>
                </Select>
                <br />
                {dataType === 'description' && <Typography variant="body2">{playerInfo.personality_long}</Typography>}
                {dataType === 'personality_tags' && playerInfo.personality_tags.map((tag) => (
                    <Chip label={tag} key={tag} />
                ))}
                {dataType === 'numeric' && <Typography variant="body2">Age: {playerInfo.age}<br />Height: {playerInfo.height}<br />Years on Tour: {playerInfo.years_on_tour}</Typography>}
                {dataType === 'categorical' && <Typography variant="body2">Hand: {playerInfo.hand}<br />Favorite Shot: {playerInfo.favorite_shot}<br />Grass Advantage: {playerInfo.grass_advantage}</Typography>}
            </CardContent>
        </Card>
    )
}

export default track({ page: "mini_card" }, { dispatch: dispatchTrackingData })(PlayerCardMini);
