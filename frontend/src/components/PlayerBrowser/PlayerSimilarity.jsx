import React, { useEffect, useState } from 'react';
import { Button, Modal, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
import PlayerCard from './PlayerCard';
import PlayerCardMini from './PlayerCardMini';

import { useParams } from 'react-router-dom';

// Tracking
import { useTracking } from 'react-tracking';

const PlayerSimilarity = ({ open, handleClose, isLoggedIn }) => {
    const { playerName: playerNameInUrl } = useParams();
    const playerName = playerNameInUrl || playerName;
    const [loading, setLoading] = useState(false);

    const [similarityWeight, setSimilarityWeight] = useState("all");
    const [similarPlayers, setSimilarPlayers] = useState([]);
    const [showSimilarPlayers, setShowSimilarPlayers] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const userId = localStorage.getItem('userId');
    
    // Tracking
    const { trackEvent } = useTracking();

    // // Fetch similarity weight from the user
    // useEffect(() => {
    //     const fetchSimilarityWeight = async () => {
    //         const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${userId}/get_similarity_weights`);
    //         const text = await response.text();
    //         const data = JSON.parse(text);
    //         setSimilarityWeight(data);
    //         // localStorage.setItem('similarity_weight', JSON.stringify(data));
    //     };

    //     // Use locally stored similarity weight if it exists
    //     // const storedSimilarityWeight = localStorage.getItem('similarity_weight');
    //     // if (isLoggedIn && !similarityWeight) fetchSimilarityWeight();
    //     // else setSimilarityWeight(JSON.parse(storedSimilarityWeight));
    // }, [userId]);

    // Fetch similar players
    const fetchSimilarPlayers = async () => {
        // Turn spaces into underscores
        const playerNameForURL = playerName.replace(/ /g, '_');
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/players/similar/${playerNameForURL}/?similarity_weight=${similarityWeight}`);
        const data = await response.json(); // Use response.json() instead of response.text()
        setSimilarPlayers(data);
        trackEvent({ action: 'fetch_similar_players', player_name: playerName, similarity_weight: similarityWeight });
    };

    useEffect(() => {
        if (showSimilarPlayers && similarPlayers.length === 0) {
            setLoading(true);
            fetchSimilarPlayers();
            setLoading(false);
        }
    }, [showSimilarPlayers]);

    const handleShowSimilarPlayers = () => {
        setShowSimilarPlayers(!showSimilarPlayers);
        trackEvent({ action: showSimilarPlayers ? 'hide_similar_players' : 'show_similar_players', player_name: playerName, similarity_weight: similarityWeight });
    };


    return (
        <Modal open={open} onClose={handleClose} style={{ overflow: 'auto' }}>
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: isMobile ? '10px' : '20px',
                position: 'relative'
            }}>
                <div>

                    <PlayerCard playerName={playerName} handleClose={handleClose} />
                    <Button
                        onClick={() => handleShowSimilarPlayers()}
                        variant="contained"
                        color={showSimilarPlayers ? 'secondary' : 'primary'}
                        style={{
                            position: 'relative',
                            bottom: 0,
                            height: '50px',
                        }}
                    >
                        {showSimilarPlayers ? 'Hide Similar Players' : 'Show Similar Players'}
                    </Button>
                </div>
                {loading && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <CircularProgress />
                    </div>
                )}
                {showSimilarPlayers && (
                    <div style={{ paddingLeft: isMobile ? "0px" : "20px" }}>
                        {similarPlayers.map(player => <PlayerCardMini key={player.player2} player={player} />)}
                    </div>
                )}
            </div>
        </Modal>
    )
}

export default PlayerSimilarity;
