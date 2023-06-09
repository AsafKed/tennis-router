import React, { useEffect, useState } from "react";
import { Typography, Box, Card, CardContent } from "@mui/material";

function RecommendationsView() {
    const userId = localStorage.getItem("userId");
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`${process.env.REACT_APP_BACKEND_URL}/recommendations/matches/${userId}`)
            .then(response => response.json())
            .then(data => {
                // Sort the data by match_time
                data.sort((a, b) => a.match_time.localeCompare(b.match_time));
                setRecommendations(data);
            })
            .catch(error => console.error('Error:', error));
        setLoading(false);
    }, [userId]);

    return (
        <Box sx={{ flexGrow: 1, m: 2 }}>
            <Typography variant="h1" gutterBottom>
                To view recommendations, fill in the settings.
            </Typography>
            <Typography variant="h5" gutterBottom>
                Why?
            </Typography>
            <Typography variant="body1" gutterBottom paddingBottom={2}>
                We use your settings to find the best recommendations for you.
                <br />
                For example, we need to know which day you're attending to recommend matches for that day.
            </Typography>
            <Typography variant="h5" gutterBottom>
                How?
            </Typography>
            <Typography variant="body1" gutterBottom paddingBottom={2}>
                <b>Click the Settings tab</b> and fill them in, then click the "Submit" button.
                <br />
                The recommendations will appear back on this tab.
            </Typography>
            <Typography variant="h5" gutterBottom>
                Attending with others?
            </Typography>

            <Typography variant="body1" gutterBottom>
                <b>Click the Groups tab.</b> There you can
            </Typography>
            <ol>
                <li><b>Create a group</b> and invite your friends</li>
                <li><b>Join a group</b> using the group ID</li>
            </ol>

            <br />
            <Typography variant="h2" gutterBottom>Recommended matches (individual)</Typography>
            <Typography variant="body1" gutterBottom>
                These will be made available every match day. Check back then!
            </Typography>
            {recommendations && recommendations.map(recommendation => (
                <Card key={recommendation.match_name} sx={{ marginBottom: 2 }}>
                    <CardContent>
                        <Typography variant="h4" gutterBottom>{recommendation.match_name}</Typography>
                        {/* render the match_date, match_time, match_location, and the priority */}
                        <Typography variant="body1" gutterBottom>
                            Date: {recommendation.match_date} <br />
                            Time: {recommendation.match_time} <br />
                            Location: {recommendation.match_location} <br />
                            Priority: {recommendation.priority}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>
    )
}

export default RecommendationsView;
