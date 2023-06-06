import React, { useEffect, useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { NavLink, useNavigate } from 'react-router-dom'
import { Alert, TextField, Typography, Paper, Button } from '@mui/material';

// Tracking
import { dispatchTrackingData } from '../TrackingDispatcher';
import { track, useTracking } from 'react-tracking';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null)

    const { trackEvent } = useTracking();

    // Upon opening the page
    useEffect(() => {
        trackEvent({ action: 'page_open' })
    }, []);

    const onLogin = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                trackEvent({ action: 'login' });
                navigate("/user")
                // console.log(user);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                setError(errorMessage)
                trackEvent({ action: 'login_error', 'error': errorCode })
                // console.log(errorCode, errorMessage)
            });

    }

    return (
        <>
            <main >
                <section>
                    <div>
                        <Typography variant="h1" component="h1" gutterBottom>
                            Login
                        </Typography>

                        <Paper elevation={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem' }}>
                            <TextField
                                sx={{ m: 1, width: '25ch' }}
                                id="email-address"
                                label="Email address"
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyPress={(e) => { if (e.key === 'Enter') onLogin(e); }}
                                required
                            />
                            <TextField
                                sx={{ m: 1, width: '25ch' }}
                                id="password"
                                label="Password"
                                variant="outlined"
                                type='password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={(e) => { if (e.key === 'Enter') onLogin(e); }}
                                required
                            />

                            {error && <Alert severity="error">{error}</Alert>}

                            <Button
                                sx={{ m: 1, width: '25ch' }}
                                variant="contained"
                                onClick={onLogin}
                            >
                                Login
                            </Button>
                        </Paper>

                        <p className="text-sm text-white text-center">
                            No account yet? {' '}
                            <Button href="/register" variant='outlined'>
                                Sign up
                            </Button>
                        </p>

                    </div>
                </section>
            </main>
        </>
    )
}

export default track({ page: 'Login' }, { dispatch: dispatchTrackingData })(Login)