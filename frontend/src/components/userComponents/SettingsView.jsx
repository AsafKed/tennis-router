import React, { useState, useEffect } from 'react';
import { Checkbox, FormGroup, FormControlLabel, Typography, Button } from '@mui/material';

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

    const { trackEvent } = useTracking();

    useEffect(() => {
        fetch(`http://localhost:5001/users/${userId}/settings`, {
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
    }, [userId]);

    const handleChange = (event) => {
        setDays({ ...days, [event.target.name]: event.target.checked });
    };

    const handleSubmit = () => {
        const selectedDays = Object.keys(days).filter(day => days[day]).map(day => day.split(":")[0].trim());

        fetch(`http://localhost:5001/users/${userId}/settings`, {
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

        trackEvent({ action: 'update_settings', days: selectedDays })
    }

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
            <Button variant="contained" onClick={handleSubmit}>Submit</Button>
        </div>
    )
}

export default track({ dispatch: dispatchTrackingData })(SettingsView);
