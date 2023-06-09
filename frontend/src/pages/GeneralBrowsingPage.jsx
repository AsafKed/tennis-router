import React, { useEffect, useState } from 'react';
import PlayerBrowsing from './PlayerBrowsingPage';
import ParameterBrowsing from "./ParameterBrowsingPage";
import TriangleSlider from "../components/TriangleSlider";
import InfoPopup from '../components/InfoPopup';

// Styling
import { Box, Button, Typography } from '@mui/material';

// Navigating
import { useNavigate, useParams } from 'react-router-dom';

// Tracking
import { dispatchTrackingData } from '../TrackingDispatcher';
import { track, useTracking } from 'react-tracking';

const BrowsingPage = () => {
    const params = useParams();
    const navigate = useNavigate();

    // Get the browse type from the url
    const browseType = params.browseType;
    const playerName = params.playerName;

    useEffect(() => {
        if (browseType !== 'player' && browseType !== 'parameter') {
            navigate('/browser/player');
        }
    }, [browseType]);

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
        if (browseType === 'player') {
            navigate('/browser/parameter');
        } else {
            navigate('/browser/player');
            trackEvent({ action: setShowPlayerSelectionPage ? 'player_view_open' : 'preference_view_open' })
        }
    }

    return (
        <div>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <Typography variant="h1">Browser Page</Typography>
                    <InfoPopup infoText="Press the switch to toggle between player browsing and parameter browsing."
                    />
                    <Button variant="contained" onClick={handleToggle}>Toggle</Button>
                </Box>
            </Box>
            {/* Remove the conditional rendering of PlayerBrowsing and ParameterBrowsing */}
            {browseType === 'player' ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <Typography variant="h1">Player browsing</Typography>
                <InfoPopup infoText="On this page you browse players at Libema-open. You can order players alphabetically or by rank. You can also find players by indicating what characteristics you prefer. If you click on a
                                         player, you can see player characteristics and also find similar players to this player.<br />
                                         If you want to get personalized recommendations for which players or matches to watch
                                         during the tournament, please register/login first."
                />
            </Box> : <Typography variant="h2">Parameter Browsing</Typography>}
            <br />
            {browseType === 'player' ? <PlayerBrowsing selectedPlayer={playerName} /> : <ParameterBrowsing />}
        </div>
    )
}

export default track({ page: 'browsing' }, { dispatch: dispatchTrackingData })(BrowsingPage);
