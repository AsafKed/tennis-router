import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardMedia, Typography, Grid, TextField, MenuItem, Button } from '@mui/material';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase';

const PlayerSelectionPage = () => {
    const [players, setPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [sortOption, setSortOption] = useState('alphabetical');
    const [userId, setId] = useState("");
    const [likedPlayers, setLikedPlayers] = useState([]);

    // Get all players
    useEffect(() => {
        const fetchPlayers = async () => {
            const response = await fetch('/players');
            const text = await response.text(); // if this doesn't work, try response.json()
            const data = JSON.parse(text)
            setPlayers(data);
        };

        fetchPlayers();
    }, []);

    // Update liked players (only after UID is known though)
    const fetchLikedPlayers = useCallback(async () => {
        const response = await fetch(`/players/liked/${userId}`);
        const text = await response.text();
        console.log("Liked players\n", text);
        const data = JSON.parse(text);
        setLikedPlayers(data);
    }, [userId]);


    // Get liked players (only after userId is known)
    useEffect(() => {
        if (userId) {
            fetchLikedPlayers();
        }
    }, [userId, fetchLikedPlayers]);

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

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const uid = user.uid;
                console.log("uid", uid)
                setId(uid);
            } else {
                // User is signed out
                console.log("user is logged out")
            }
        });

    }, [])

    // Liking -> create user-player relationship
    const handleLike = async (playerName) => {
        try {
            const response = await fetch(`/players/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId, name: playerName }),
            });

            if (!response.ok) {
                throw new Error('Failed to like player');
            }

            fetchLikedPlayers();
        } catch (error) {
            console.error(error);
        }
    };

    const handleUnlike = async (playerName) => {
        try {
            const response = await fetch(`/players/unlike`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId, name: playerName }),
            });

            if (!response.ok) {
                throw new Error('Failed to unlike player');
            }

            fetchLikedPlayers();

            // Update the likedPlayers state
            setLikedPlayers(likedPlayers.filter(likedPlayer => likedPlayer.name !== playerName));
        } catch (error) {
            console.error(error);
        }
    };

    const isLiked = (playerName) => {
        return likedPlayers.some(likedPlayer => likedPlayer.name === playerName);
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
            <h2>Liked Players</h2>
            <Grid container spacing={4} style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}>
                {likedPlayers.map((player) => (
                    <Card key={player.name}>
                        <CardMedia
                            component="img"
                            height="300"
                            image={player.image_url}
                            alt={player.name}
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                {player.name}
                            </Typography>
                            <Button onClick={() => handleUnlike(player.name)}>
                                Unlike
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </Grid>
            <h2>Other Players</h2>
            <Grid container spacing={4}>
                {filteredPlayers.map((player) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={player.name}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="300"
                                image={player.image_url}
                                alt={player.name}
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    {player.name}
                                </Typography>
                                <Button variant="contained" color="primary" onClick={() => handleLike(player.name)}>
                                    Like
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default PlayerSelectionPage;
