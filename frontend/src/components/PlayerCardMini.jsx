import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Select, MenuItem } from '@mui/material';
import ReactCountryFlag from "react-country-flag";
import Chip from '@mui/material/Chip';

const PlayerCardMini = ({ player }) => {
    // Get info on the player
    const [playerInfo, setPlayerInfo] = useState({});
    const [dataType, setDataType] = useState('description');

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

    const handleDataTypeChange = (event) => {
        setDataType(event.target.value);
    };

    return (
        <Card style={{ width: '33vw', height: '33vh', marginBottom: '20px' }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    {player.player2}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Similarity: {Math.round(player.similarity*100)}%
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
