import React, { useEffect, useState } from "react";
import { Typography, Box, Card, CardContent, Button, Grid, Link } from "@mui/material";
import InfoPopup from "../InfoPopup";
import { useNavigate } from "react-router-dom";

function RecommendationsView() {
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState('priority'); // default sort by location+time

    const sortData = (data, sortBy) => {
        if (sortBy === 'location_time') {
            return data.sort((a, b) => {
                if (a.match_location < b.match_location) return -1;
                if (a.match_location > b.match_location) return 1;
                if (a.match_time < b.match_time) return -1;
                if (a.match_time > b.match_time) return 1;
                return 0;
            });
        } else { // priority
            return data.sort((a, b) => {
                return b.priority - a.priority;
            });
        }
    }

    useEffect(() => {
        setLoading(true);
        fetch(`${process.env.REACT_APP_BACKEND_URL}/recommendations/matches/${userId}`)
            .then(response => response.json())
            .then(data => {
                data = sortData(data, sortBy);
                setRecommendations(data);
            })
            .catch(error => console.error('Error:', error));
        setLoading(false);
    }, [userId, sortBy]);

    const navigateToPlayer = (player) => {
        // Convert spaces to underscores
        player = player.replace(/ /g, '_');
        console.log(player);
        navigate(`/browser/player/${player}`);
    }

    return (
        <Box sx={{ flexGrow: 1, m: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 2 }}>
                <Typography variant="h2" gutterBottom>Recommended matches (individual)</Typography>
                <InfoPopup infoText="These are today's matches, based on similar players to the ones you liked." />
            </Box>
            <Button variant={sortBy === 'priority' ? "contained" : "outlined"} color="primary" onClick={() => setSortBy('priority')}>Sort by Priority</Button>
            <Button variant={sortBy === 'location_time' ? "contained" : "outlined"} color="primary" onClick={() => setSortBy('location_time')}>Sort by Location+Time</Button>
            {recommendations && recommendations.map(recommendation => {
                const players = recommendation.match_name.split(' vs ');
                return (
                    <Card key={recommendation.match_name} sx={{ marginBottom: 2 }}>
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <Link component="button" variant="h6" onClick={() => navigateToPlayer(players[0])}>
                                        {players[0]}
                                    </Link>
                                    <Typography variant="body1">vs</Typography>
                                    <Link component="button" variant="h6" onClick={() => navigateToPlayer(players[1])}>
                                        {players[1]}
                                    </Link>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="h5" align="center">{Math.round(recommendation.priority*100)}% match</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body1">
                                        {recommendation.match_location} <br />
                                        timeslot {recommendation.match_time}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                )
            })}
        </Box>
    )
}

export default RecommendationsView;
