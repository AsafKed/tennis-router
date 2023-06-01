import React, { useEffect, useState } from 'react';
import { Modal } from '@mui/material';
import PlayerCard from './PlayerCard';
import PlayerCardMini from './PlayerCardMini';

const PlayerSimilarity = ({ playerName, userId }) => {
    const [similarityWeight, setSimilarityWeight] = useState("all");
    const [similarPlayers, setSimilarPlayers] = useState([]);
    const [open, setOpen] = useState(true);

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
            console.log(`Similar players for ${playerName}:`, data); // Log data as a separate argument
            setSimilarPlayers(data);
        };

        fetchSimilarPlayers();
    }, [playerName, userId, similarityWeight]);

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <PlayerCard playerName={playerName} />
                {similarPlayers.map(player => <PlayerCardMini key={player.player2} player={player} />)}
            </div>
        </Modal>
    )
}

export default PlayerSimilarity;
