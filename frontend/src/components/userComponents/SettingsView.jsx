import React from 'react';
import { Checkbox, FormGroup, FormControlLabel, Typography, Button } from '@mui/material';

function SettingsView({ userId }) {
    const [days, setDays] = useState([]);
    // /users/userId/settings the location to send the settings to in the backend
    const handleSubmit = () => {
        fetch(`http://localhost:5001/users/${userId}/settings`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                days: days,
            }),
        })
            .then((response) => {
                return response.json();
            })

    }

    return (
        <div>
            <Typography variant="h1" gutterBottom>
                Settings
            </Typography>
            <Typography variant="h5" gutterBottom>
                Fill in your settings to get recommendations.
            </Typography>
            <Typography variant="body1" gutterBottom paddingBottom={2}>
                We use your settings to find the best recommendations for you.
            </Typography>
            <Typography variant="h5" gutterBottom>
                Which days are you attending?
            </Typography>
            <FormGroup>
                <FormControlLabel control={<Checkbox />} label="10/06/2023: Satuday" />
                <FormControlLabel control={<Checkbox />} label="11/06/2023: Sunday" />
                <FormControlLabel control={<Checkbox />} label="12/06/2023: Monday" />
                <FormControlLabel control={<Checkbox />} label="13/06/2023: Tuesday" />
                <FormControlLabel control={<Checkbox />} label="14/06/2023: Wednesday" />
                <FormControlLabel control={<Checkbox />} label="15/06/2023: Thursday" />
                <FormControlLabel control={<Checkbox />} label="16/06/2023: Friday" />
                <FormControlLabel control={<Checkbox />} label="17/06/2023: Saturday" />
                <FormControlLabel control={<Checkbox />} label="18/06/2023: Sunday" />
            </FormGroup>
            <Button variant="contained">Submit</Button>
        </div>
    )
}

export default SettingsView;