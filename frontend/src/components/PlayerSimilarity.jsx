import React, { useEffect, useState } from 'react';
import { Button, Modal, useMediaQuery, useTheme } from '@mui/material';
import PlayerCard from './PlayerCard';
import PlayerCardMini from './PlayerCardMini';

// Tracking
import track, { useTracking } from 'react-tracking';

const PlayerSimilarity = ({ playerName, userId, open, handleClose }) => {
    const [similarityWeight, setSimilarityWeight] = useState("all");
    const [similarPlayers, setSimilarPlayers] = useState([]);
    const [showSimilarPlayers, setShowSimilarPlayers] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Tracking
    const { trackEvent } = useTracking();

    // Fetch similarity weight from the user
    useEffect(() => {
        const fetchSimilarityWeight = async () => {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${userId}/get_similarity_weights`);
            const text = await response.text();
            const data = JSON.parse(text);
            setSimilarityWeight(data);
        };

        fetchSimilarityWeight();
    }, [userId]);

    // Fetch similar players
    useEffect(() => {
        const fetchSimilarPlayers = async () => {
            // Turn spaces into underscores
            const playerNameForURL = playerName.replace(/ /g, '_');
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/players/similar/${playerNameForURL}/?user_id=${userId}`);
            const data = await response.json(); // Use response.json() instead of response.text()
            setSimilarPlayers(data);
        };
        trackEvent({ action: 'fetch_similar_players', player_name: playerName, similarity_weight: similarityWeight });
        fetchSimilarPlayers();
    }, [playerName, userId, similarityWeight]);

    return (
        <Modal open={open} onClose={handleClose}>
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
                position: 'relative'
            }}>
                <PlayerCard playerName={playerName} />
                <Button
                    onClick={() => setShowSimilarPlayers(!showSimilarPlayers)}
                    variant="contained"
                    color="primary"
                    style={{
                        position: 'absolute',
                        bottom: showSimilarPlayers ? 'initial' : '20px',
                        right: showSimilarPlayers ? 'initial' : '0px',
                        height: '50px',
                        alignSelf: showSimilarPlayers ? 'center' : 'initial',
                        marginTop: showSimilarPlayers ? '20px' : 'initial'
                    }}
                >
                    {showSimilarPlayers ? 'Hide Similar Players' : 'Show Similar Players'}
                </Button>
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
