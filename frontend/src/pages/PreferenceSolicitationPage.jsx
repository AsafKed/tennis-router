import React, { useState } from 'react';
import PlayerSelectionPage from './PlayerSelectionPage';
import UserPreferences from "../components/UserPreferences";


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
            {showPlayerSelectionPage ? <PlayerSelectionPage /> : <UserPreferences />}
        </div>
    )
}

export default PreferenceSolicitationPage;