// LikeButton.jsx
import React from 'react';
import { Button } from '@mui/material';

const LikeButton = ({ isLiked, onLike, onUnlike }) => {
    const handleClick = (event) => {
        event.stopPropagation(); // This will prevent the event from propagating to the parent elements

        if (isLiked) {
            onUnlike();
        } else {
            onLike();
        }
    };

    return (
        <Button 
            variant="contained" 
            color={isLiked ? "secondary" : "primary"} // Change color based on whether the player is liked or not
            onClick={handleClick}
        >
            {isLiked ? 'Unlike' : 'Like'}
        </Button>
    );
};

export default LikeButton;
