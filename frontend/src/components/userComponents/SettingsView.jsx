import React, { useState, useEffect } from 'react';
import { Checkbox, FormGroup, FormControlLabel, Typography, Button, CircularProgress, Snackbar, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MuiAlert from '@mui/material/Alert';

// Tracking
import { track, useTracking } from 'react-tracking';
import { dispatchTrackingData } from '../../TrackingDispatcher';

function SettingsView({ userId }) {
    const [days, setDays] = useState({
        '10/06/2023: Saturday': false,
        '11/06/2023: Sunday': false,
        '12/06/2023: Monday': false,
        '13/06/2023: Tuesday': false,
        '14/06/2023: Wednesday': false,
        '15/06/2023: Thursday': false,
        '16/06/2023: Friday': false,
        '17/06/2023: Saturday': false,
        '18/06/2023: Sunday': false,
    });
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const { trackEvent } = useTracking();

    useEffect(() => {
        setLoading(true);
        fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${userId}/settings`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                let newDays = { ...days };
                data.days.forEach(day => {
                    const dayOfWeek = new Date(day.split('/').reverse().join('-')).toLocaleString('en-US', { weekday: 'long' });
                    newDays[`${day}: ${dayOfWeek}`] = true;
                });
                setDays(newDays);
                trackEvent({ action: 'get_settings' })
            });
        setLoading(false);
    }, [userId]);

    const handleChange = (event) => {
        setDays({ ...days, [event.target.name]: event.target.checked });
    };

    const handleSubmit = () => {
        const selectedDays = Object.keys(days).filter(day => days[day]).map(day => day.split(":")[0].trim());
        setSubmitting(true);
        fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${userId}/settings`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                days: selectedDays,
            }),
        })
            .then((response) => {
                return response.json();
            })
        setSubmitting(false);
        setSubmitting(false);
        setOpenSnackbar(true);
        trackEvent({ action: 'update_settings', days: selectedDays })
    }

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    return (
        <div>
            <Typography variant="h1" gutterBottom>
                Settings
            </Typography>
            <Typography variant="h5" gutterBottom>
                Which days are you attending?
            </Typography>
            <FormGroup>
                {Object.keys(days).map((day, index) => (
                    <FormControlLabel
                        key={index}
                        control={
                            <Checkbox
                                checked={days[day]}
                                onChange={handleChange}
                                name={day}
                            />
                        }
                        label={day}
                    />
                ))}
            </FormGroup>
            {/* If submitting load a Circular progress over the entire page. If submitted, change it to a checkmark which goes away by itself after 0.8 seconds */}
            {submitting && <CircularProgress />}
            <Snackbar open={openSnackbar} autoHideDuration={800} onClose={handleCloseSnackbar}>
                <MuiAlert onClose={handleCloseSnackbar} severity="success" elevation={6} variant="filled">
                    <Box display="flex" alignItems="center">
                        <CheckCircleIcon />
                        <Typography variant="body1" style={{ paddingLeft: '10px' }}>
                            Settings updated successfully!
                        </Typography>
                    </Box>
                </MuiAlert>
            </Snackbar>
            <br /> 
            <Button variant="contained" onClick={handleSubmit}>Submit</Button>
        </div>
    )
}

export default track({ dispatch: dispatchTrackingData })(SettingsView);
