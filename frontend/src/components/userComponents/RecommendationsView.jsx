import React from "react";
import { Typography } from "@mui/material";

function RecommendationsView({ userId }) {
    return (
        <div>
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
                <ol>
                    <li><b>Create a group</b> and invite your friends</li>
                    <li><b>Join a group</b> using the group ID</li>
                </ol>
            </Typography>
        </div>
    )
}

export default RecommendationsView;