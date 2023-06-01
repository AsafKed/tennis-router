import React, { useState } from 'react';
import PlayerSelectionPage from '../components/PlayerSelection';
import UserPreferences from "../components/UserPreferences";
import TriangleSlider from "../components/TriangleSlider";

const PreferenceSolicitationPage = () => {
    // Have a toggle to show either the player selection page or the user preferences page
    const [showPlayerSelectionPage, setShowPlayerSelectionPage] = useState(true);

    const handleToggle = () => {
        setShowPlayerSelectionPage(!showPlayerSelectionPage);
    }

    return (
        <div>
            <h1>Preference Solicitation</h1>
            <button onClick={handleToggle}>Toggle</button>
            <TriangleSlider />
            {showPlayerSelectionPage ? <PlayerSelectionPage /> : <UserPreferences />}
        </div>
    )
}

export default PreferenceSolicitationPage;
