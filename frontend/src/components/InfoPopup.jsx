import React from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';

const InfoPopup = ({ infoText }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <>
            <Tooltip title="More Info">
                <IconButton onClick={handleClick}>
                    <InfoOutlinedIcon sx={{ fontSize: "2rem" }} color='secondary' />
                </IconButton>
            </Tooltip>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <Box sx={{ position: 'relative', p: 2 }}>
                    <Box sx={{ pr: 4 }}> {/* Add padding to the right side of the text box */}
                        {infoText.split('<br />').map((text, index) => (
                            <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                                {text}
                            </Typography>
                        ))}
                    </Box>
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Popover>
        </>
    );
};

export default InfoPopup;
