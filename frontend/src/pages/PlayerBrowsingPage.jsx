import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardMedia, Typography, Grid, TextField, MenuItem, Button } from '@mui/material';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebase';
import PlayerSimilarity from '../components/PlayerBrowser/PlayerSimilarity';
import ReactCountryFlag from "react-country-flag";
import LikeButton from '../components/LikeButton';

// Tracking
import { useTracking } from 'react-tracking';

const PlayerBrowsing = () => {
    const [players, setPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [sortOption, setSortOption] = useState('rank');
    const [userId, setId] = useState("");
    const [likedPlayers, setLikedPlayers] = useState([]);
    const [sortedLikedPlayers, setSortedLikedPlayers] = useState([]);

    // Player clicking
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isPlayerCardOpen, setIsPlayerCardOpen] = useState(false);
    // Only allow to like if logged in
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    // Tracking
    const { trackEvent } = useTracking();

    // Get all players
    useEffect(() => {
        const fetchPlayers = async () => {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/players`);
            const text = await response.text(); // if this doesn't work, try response.json()
            const data = JSON.parse(text)
            setPlayers(data);
        };

        fetchPlayers();
    }, []);

    // Update liked players (only after UID is known though)
    const fetchLikedPlayers = useCallback(async () => {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/players/liked/${userId}`);
        const text = await response.text();
        const data = JSON.parse(text);
        setLikedPlayers(data);
    }, [userId]);


    // Get liked players (only after userId is known)
    useEffect(() => {
        if (userId) {
            fetchLikedPlayers();
        }
    }, [userId, fetchLikedPlayers]);

    // Sort players, remove liked players
    useEffect(() => {
        let sortedPlayers = [...players];
        setSortedLikedPlayers(likedPlayers.sort((a, b) => a.rank - b.rank));

        trackEvent({ action: 'sort_players', sort_option: sortOption });

        if (sortOption === 'alphabetical') {
            sortedPlayers.sort((a, b) => a.name.localeCompare(b.name));
            sortedLikedPlayers.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOption === 'rank') {
            sortedPlayers.sort((a, b) => a.rank - b.rank);
            sortedLikedPlayers.sort((a, b) => a.rank - b.rank);
        }

        // Map likedPlayers to an array of names
        const likedPlayerNames = likedPlayers.map(player => player.name);

        // Remove liked players from sortedPlayers
        sortedPlayers = sortedPlayers.filter((player) => !likedPlayerNames.includes(player.name));
        setFilteredPlayers(sortedPlayers);
    }, [players, sortOption, likedPlayers]);


    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const uid = user.uid;
                setId(uid);
                setIsLoggedIn(true);
            } else {
                // User is signed out
                console.log("user is logged out")
                setIsLoggedIn(false);
            }
        });

    }, [])

    // Liking -> create user-player relationship
    const handleLike = async (playerName) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/players/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId, name: playerName }),
            });

            if (!response.ok) {
                throw new Error('Failed to like player');
            }
            trackEvent({ action: 'like_player', player_name: playerName });
            fetchLikedPlayers();
        } catch (error) {
            console.error(error);
        }
    };

    const handleUnlike = async (playerName) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/players/unlike`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId, name: playerName }),
            });

            if (!response.ok) {
                throw new Error('Failed to unlike player');
            }
            trackEvent({ action: 'unlike_player', player_name: playerName });
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

    // Player clicking
    const handlePlayerClick = (playerName) => {
        setSelectedPlayer(playerName);
        setIsPlayerCardOpen(true);
        trackEvent({ action: 'view_player', player_name: playerName });
    };

    const handlePlayerCardClose = () => {
        setIsPlayerCardOpen(false);
        trackEvent({ action: 'close_player' });
    };

    return (
        <div style={{ padding: '0 16px' }}>
            <TextField
                select
                label="Sort by"
                value={sortOption}
                onChange={handleSortChange}
                variant="outlined"
                style={{ marginBottom: '16px' }}
            >
                <MenuItem value="rank">Rank</MenuItem>
                <MenuItem value="alphabetical">Alphabetical</MenuItem>
            </TextField>

            {isLoggedIn && (
                <div>
                    <h2>Liked Players</h2>

                    <Grid container spacing={4}>
                        {sortedLikedPlayers.map((player) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={player.name}>
                                <Card onClick={() => handlePlayerClick(player.name)} style={{ position: 'relative' }}>
                                    <CardMedia
                                        component="img"
                                        height="300"
                                        image={player.image_url}
                                        alt={player.name}
                                        sx={{ objectFit: 'contain' }}
                                    />
                                    <CardContent>
                                        <Typography gutterBottom variant="h5" component="div">
                                            {player.name}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            Rank: {player.rank}
                                        </Typography>
                                        {isLoggedIn && (
                                            <LikeButton isLiked={isLiked(player.name)}
                                                onLike={() => handleLike(player.name)}
                                                onUnlike={() => handleUnlike(player.name)}
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </div>
            )}

            <h2>Other Competitors</h2>
            <Grid container spacing={4}>
                {filteredPlayers.map((player) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={player.name}>
                        <Card onClick={() => handlePlayerClick(player.name)} style={{ position: 'relative' }}>
                            <CardMedia
                                component="img"
                                height="300"
                                image={player.image_url}
                                alt={player.name}
                                sx={{ objectFit: 'contain', padding: '1em' }}
                            />
                            {/* Only display the flag if the player.country_code is not empty */}
                            {player.country_code && (
                                <ReactCountryFlag
                                    countryCode={player.country_code}
                                    style={{
                                        width: '3em',
                                        height: '3em',
                                        position: 'absolute',
                                        top: '10px',
                                        left: '10px',
                                        zIndex: 1, // make the flag appear above the image
                                    }}
                                    svg
                                />
                            )}
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="div">
                                    {player.name}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Rank: {player.rank}
                                </Typography>
                                {/* Only display the like button if the user is logged in */}
                                {isLoggedIn && (
                                    <LikeButton isLiked={isLiked(player.name)}
                                        onLike={() => handleLike(player.name)}
                                        onUnlike={() => handleUnlike(player.name)}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            {selectedPlayer && <PlayerSimilarity playerName={selectedPlayer} userId={userId} open={isPlayerCardOpen} handleClose={handlePlayerCardClose} isLoggedIn={isLoggedIn} />}        </div>
    );
};

export default PlayerBrowsing;