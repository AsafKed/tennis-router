import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, Grid, TextField, MenuItem } from '@mui/material';

const PlayerSelectionPage = () => {
    const [players, setPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [sortOption, setSortOption] = useState('alphabetical');

    useEffect(() => {
        const fetchPlayers = async () => {
            const response = await fetch('/players');
            const text = await response.text(); // if this doesn't work, try response.json()
            console.log(text);
            const data = JSON.parse(text)

            // Map players and set rank to null if it's Infinity
            const cleanedData = data.map(player => {
                if (player.rank === Infinity) {
                    player.rank = null;
                }
                return player;
            });

            setPlayers(cleanedData);
        };
        fetchPlayers();
    }, []);

    useEffect(() => {
        let sortedPlayers = [...players];

        if (sortOption === 'alphabetical') {
            sortedPlayers.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOption === 'rank') {
            sortedPlayers.sort((a, b) => a.rank - b.rank);
        }

        setFilteredPlayers(sortedPlayers);
    }, [players, sortOption]);

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    return (
        <div>
            <h1>Player Selection</h1>
            <TextField
                select
                label="Sort by"
                value={sortOption}
                onChange={handleSortChange}
                variant="outlined"
                style={{ marginBottom: '16px' }}
            >
                <MenuItem value="alphabetical">Alphabetical</MenuItem>
                <MenuItem value="rank">Rank</MenuItem>
            </TextField>
            <Grid container spacing={4}>
                {filteredPlayers.map((player) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={player.player_id}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="300"
                                image={player.image}
                                alt={player.name}
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    {player.name}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default PlayerSelectionPage;
