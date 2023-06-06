import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Alert, Button, Typography, Paper, TextField } from '@mui/material';

// Tracking
import { dispatchTrackingData } from '../TrackingDispatcher';
import { track, useTracking } from 'react-tracking';

function Register() {
    const navigate = useNavigate();
    const { trackEvent } = useTracking();

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');

    // Upon opening the page
    useEffect(() => {
        trackEvent({ action: 'page_open' })
    }, []);


    const sendUserDataToServer = async (userId, userEmail, userName) => {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: userId,
                email: userEmail,
                name: userName,
            }),
        });
        const data = await response.json();
        // console.log("Server response:", data);
    };

    const onSubmit = async (e) => {
        e.preventDefault()

        await createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                // Signed in
                const user = userCredential.user;
                // console.log(user);
                await sendUserDataToServer(user.uid, user.email, displayName);

                trackEvent({ action: 'register' });
                navigate("/user")
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // console.log(errorCode);
                // console.log(errorMessage);

                trackEvent({ action: 'register_error', 'error': errorCode })
                setError(errorMessage);
            });

    }

    return (
        <main >
            <section>
                <div>
                    <div>
                        <Typography variant="h1" component="h1" gutterBottom>
                            Register
                        </Typography>

                        <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem' }}>
                            <TextField
                                sx={{ m: 1, width: '25ch' }}
                                id="display-name"
                                label="Display name"
                                variant="outlined"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                            />
                            <TextField
                                sx={{ m: 1, width: '25ch' }}
                                id="email-address"
                                label="Email address"
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <TextField
                                sx={{ m: 1, width: '25ch' }}
                                id="password"
                                label="Password"
                                variant="outlined"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Typography variant="body2" gutterBottom sx={{paddingBlockStart: '1rem'}}>
                                By clicking Sign up, you agree to our <a href="https://www.jads.nl/privacy-statement/" target='_blank'>Privacy Policy</a>.
                            </Typography>

                            <Button
                                variant="contained"
                                type="submit"
                                onClick={onSubmit}
                                sx={{ mt: 3, mb: 2, width: '90%' }}
                            >
                                Sign up
                            </Button>
                        </Paper>

                        {error && <Alert severity="error">{error}</Alert>}

                        <p>
                            Already have an account?{' '}
                            {/* Stretch button to fill its container */}
                            <Button href="/login" variant='outlined' >
                                Sign in
                            </Button>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default track({ page: 'Register' }, { dispatch: dispatchTrackingData })(Register);