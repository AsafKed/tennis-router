import React, { useEffect, useState } from "react";
import { Typography, Box, Card, CardContent, Button, Grid, Link, Paper, Alert } from "@mui/material";
import InfoPopup from "../InfoPopup";
import { useNavigate } from "react-router-dom";

function RecommendationsView() {
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState('time_priority_best'); // default sort by location+time
    const [zeroPriorityCount, setZeroPriorityCount] = useState(0); // bug handling

    const sortData = (data, sortBy) => {
        if (sortBy === 'location_time') {
            return data.sort((a, b) => {
                if (a.match_location < b.match_location) return -1;
                if (a.match_location > b.match_location) return 1;
                if (a.match_time < b.match_time) return -1;
                if (a.match_time > b.match_time) return 1;
                return 0;
            });
        } else if (sortBy === 'time_priority_best') {
            // First, sort by time and then priority.
            data.sort((a, b) => {
                if (a.match_time < b.match_time) return -1;
                if (a.match_time > b.match_time) return 1;
                return b.priority - a.priority;
            });

            // Then, filter to keep only the highest priority match in each timeslot.
            let timeSlots = {};
            data.forEach(item => {
                if (!timeSlots[item.match_time] || item.priority > timeSlots[item.match_time].priority) {
                    timeSlots[item.match_time] = item;
                }
            });

            return Object.values(timeSlots);
        } else if (sortBy === 'time_priority') {
            return data.sort((a, b) => {
                if (a.match_time < b.match_time) return -1;
                if (a.match_time > b.match_time) return 1;
                return b.priority - a.priority;
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
                if (data.error) {
                    console.error(data.error);
                    return;
                }
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


    // Bug handling
    useEffect(() => {
        if (recommendations) {
            setZeroPriorityCount(recommendations.filter(recommendation => recommendation.priority === 0).length);
        }
    }, [recommendations]);


    return (
        <Box sx={{ flexGrow: 1, m: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 2 }}>
                <Typography variant="h2" gutterBottom>Recommended matches (individual)</Typography>
                <InfoPopup infoText="These are today's matches, based on similar players to the ones you liked." />
            </Box>
            <Paper elevation={0} sx={{ padding: 1, marginBottom: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
                    <Typography sx={{ marginRight: 3 }} variant="h4" gutterBottom>Sort by:</Typography>
                    <Button sx={{ marginRight: 2 }} variant={sortBy === 'time_priority_best' ? "contained" : "outlined"} color="primary" onClick={() => setSortBy('time_priority_best')}>Best matches for you</Button>
                    <Button sx={{ marginRight: 2 }} variant={sortBy === 'location_time' ? "contained" : "outlined"} color="primary" onClick={() => setSortBy('location_time')}>Normal schedule</Button>
                    <Button sx={{ marginRight: 2 }} variant={sortBy === 'priority' ? "contained" : "outlined"} color="primary" onClick={() => setSortBy('priority')}>Priority (all)</Button>
                    <Button sx={{ marginRight: 2 }} variant={sortBy === 'time_priority' ? "contained" : "outlined"} color="primary" onClick={() => setSortBy('time_priority')}>Priority (timeslot)</Button>
                </Box>
            </Paper>

            {recommendations && recommendations.map(recommendation => {
                {zeroPriorityCount > 1 && 
                    <Alert severity="warning">
                        There's a bug causing multiple recommendations to have a priority of 0. Try unliking all players, then liking players again to fix this.
                    </Alert>
                }
                
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
                                    <Typography variant="h5" align="center">{Math.round(recommendation.priority * 100)}% match</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="h5">
                                        {recommendation.match_location}
                                        <br />
                                        <br />
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
