import React from 'react';
import { Typography, Box } from '@mui/material';

const DataUsagePolicy = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '2rem' }}>
            <Typography variant="h1" sx={{ marginBottom: '2rem' }}>Data Usage Policy</Typography>
            <Typography variant="body1" align="justify">
                This website is to be used for research on our recommender system, which is part of a MSc thesis Research project of Asaf Kedem at JADS, supervised by dr. Martijn Willemsen.
                <br /><br />
                The web app will securely store your email address, your interactions with the app and answers to questions in our surveys. The web-app is hosted on a European server of Heroku that adheres to GDPR guidelines, You will receive emails during the tournament with recommended schedules and links to short questionnaires to evaluate the system.
                <br /><br />
                After the tournament is over, we will anonymize the data and permanently delete your email address. The anonymized data might be shared with other researchers for follow-up research.
            </Typography>
        </Box>
    );
};

export default DataUsagePolicy;
