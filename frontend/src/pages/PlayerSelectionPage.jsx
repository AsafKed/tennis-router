import React, { useState, useEffect } from 'react';
import { Autocomplete } from '@mui/material';
import { TextField, Button } from '@mui/material';
import { auth } from '../firebase';

const PlayerSelectionPage = () => {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      const response = await fetch('/players');
      const data = await response.json();
      console.log(data);
      setPlayers(data);
    };

    fetchPlayers();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLike = async (like) => {
    if (!selectedPlayer || !user) return;

    const response = await fetch(`/like-player/${user.uid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playerId: selectedPlayer.id,
        like: like,
      }),
    });

    if (response.ok) {
      alert('Your preference has been saved.');
    } else {
      alert('Error while saving your preference.');
    }
  };

  return (
    <div>
      <h1>Player Selection</h1>
      <Autocomplete
        options={players}
        getOptionLabel={(option) => option.name}
        style={{ width: 300 }}
        onChange={(_, value) => setSelectedPlayer(value)}
        renderInput={(params) => <TextField {...params} label="Select a player" />}
      />
      {selectedPlayer && (
        <div>
          <h2>Player Details</h2>
          <p>Name: {selectedPlayer.name}</p>
          <p>ID: {selectedPlayer.id}</p>
          <Button variant="contained" color="primary" onClick={() => handleLike(true)}>
            Like
          </Button>
          <Button variant="contained" color="secondary" onClick={() => handleLike(false)}>
            Dislike
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlayerSelectionPage;
