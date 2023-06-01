import React, { useEffect, useState } from 'react';
import { Button, Modal } from '@mui/material';
import PlayerCard from './PlayerCard';
import PlayerCardMini from './PlayerCardMini';

const PlayerSimilarity = ({ playerName, userId, open, handleClose }) => {
    const [similarityWeight, setSimilarityWeight] = useState("all");
    const [similarPlayers, setSimilarPlayers] = useState([]);
    const [showSimilarPlayers, setShowSimilarPlayers] = useState(false);

    // Fetch similarity weight from the user
    useEffect(() => {
        const fetchSimilarityWeight = async () => {
            const response = await fetch(`/users/${userId}/get_similarity_weights`);
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
            const response = await fetch(`/players/similar/${playerNameForURL}/?user_id=${userId}`);
            const data = await response.json(); // Use response.json() instead of response.text()
            setSimilarPlayers(data);
        };

        fetchSimilarPlayers();
    }, [playerName, userId, similarityWeight]);

    return (
        <Modal open={open} onClose={handleClose}>
            <div style={{
                display: 'flex',
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
                        bottom: '20px',
                        right: '0px',
                        height: '50px',
                    }}                >
                    {showSimilarPlayers ? 'Hide Similar Players' : 'Show Similar Players'}
                </Button>
                <div style={{paddingLeft: "20px"}}>
                    {showSimilarPlayers && similarPlayers.map(player => <PlayerCardMini key={player.player2} player={player} />)}
                </div>
            </div>
        </Modal>
    )
}

export default PlayerSimilarity;
