import React, { useEffect, useState } from 'react';
import PlayerSelectionPage from '../components/PlayerSelection';
import UserPreferences from "../components/UserPreferences";
import TriangleSlider from "../components/TriangleSlider";

// Tracking
import { dispatchTrackingData } from '../TrackingDispatcher';
import { track, useTracking } from 'react-tracking';

const PreferenceSolicitationPage = () => {
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
            <h1>Preference Solicitation</h1>
            <button onClick={handleToggle}>Toggle</button>
            {/* <TriangleSlider /> */}
            {showPlayerSelectionPage ? <PlayerSelectionPage /> : <UserPreferences />}
        </div>
    )
}

export default track({ page: 'preferences' }, { dispatch: dispatchTrackingData })(PreferenceSolicitationPage);
