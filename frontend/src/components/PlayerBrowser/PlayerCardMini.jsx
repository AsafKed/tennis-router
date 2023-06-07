import React, { useEffect, useState } from 'react';
// Styling
import { Card, CardContent, Typography, Select, MenuItem } from '@mui/material';
import Chip from '@mui/material/Chip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import ReactCountryFlag from "react-country-flag";

const PlayerCardMini = ({ player }) => {
    // Get info on the player
    const [playerInfo, setPlayerInfo] = useState({});
    const [dataType, setDataType] = useState('description');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchPlayerInfo = async () => {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/players/data/${player.player2}`);
            const text = await response.text();
            const data = JSON.parse(text);
            setPlayerInfo(data);
        };

        fetchPlayerInfo();
    }, [player.player2]);

    const handleDataTypeChange = (event) => {
        setDataType(event.target.value);
    };

    return (
        <Card style={{ width: isMobile ? '90vw' : '33vw', height: 'auto', marginBottom: '20px' }}>
            <CardContent style={{ padding: '20px' }}>
                <Typography variant="h5" component="div">
                    {player.player2}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Similarity: {Math.round(player.similarity * 100)}%
                </Typography>
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
                {playerInfo.image_url && <img src={playerInfo.image_url} alt={playerInfo.name} style={{ width: '50%', height: 'auto' }} />}
                {playerInfo.country_code && (
                    <ReactCountryFlag
                        countryCode={playerInfo.country_code}
                        style={{
                            width: '1em',
                            height: '1em',
                            paddingRight: '0.5em',
                        }}
                        svg
                    />
                )}
                {playerInfo.country && <Typography variant="body2">{playerInfo.country}</Typography>}
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

export default PlayerCardMini;
