import React, { useEffect, useState } from 'react';
import PlayerBrowsing from './PlayerBrowsingPage';
import ParameterBrowsing from "../components/ParameterBrowsing";
import TriangleSlider from "../components/TriangleSlider";

// Tracking
import { dispatchTrackingData } from '../TrackingDispatcher';
import { track, useTracking } from 'react-tracking';
import { Box, Button, Typography } from '@mui/material';

const BrowsingPage = ({ inputPlayer }) => {
    // Have a toggle to show either the player selection page or the user preferences page
    const [showPlayerSelectionPage, setShowPlayerSelectionPage] = useState(true);

    //Tracking
    const { trackEvent } = useTracking();
    // Upon opening the page
    useEffect(() => {
        trackEvent({ action: 'page_open' })
        trackEvent({ action: setShowPlayerSelectionPage ? 'player_view_open' : 'preference_view_open' })
    }, []);

    const handleToggle = () => {
        setShowPlayerSelectionPage(!showPlayerSelectionPage);
        trackEvent({ action: setShowPlayerSelectionPage ? 'player_view_open' : 'preference_view_open' })
    }

    return (
        <div>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Typography variant="h1">Browser Page</Typography>
                {/* <TriangleSlider /> */}
                <Button onClick={handleToggle} variant='contained'>Toggle browse type</Button>
            </Box>
            {showPlayerSelectionPage ? <Typography variant="h2">Player Browsing</Typography> : <Typography variant="h2">Parameter Browsing</Typography>}
            {showPlayerSelectionPage ? <PlayerBrowsing  /> : <ParameterBrowsing />}
        </div>
    )
}

export default track({ page: 'browsing' }, { dispatch: dispatchTrackingData })(BrowsingPage);
