import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Alert } from '@mui/material';

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
                        <h1> FocusApp </h1>
                        <form>
                            <div>
                                <label htmlFor="display-name">
                                    Display name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Display Name"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="email-address">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    label="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Email address"
                                />
                            </div>

                            <div>
                                <label htmlFor="password">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    label="Create password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Password"
                                />
                            </div>

                            <button
                                type="submit"
                                onClick={onSubmit}
                            >
                                Sign up
                            </button>
                            {error && <Alert severity="error">{error}</Alert>}

                        </form>
                        <p>
                            Already have an account?{' '}
                            <NavLink to="/login" >
                                Sign in
                            </NavLink>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default track({ page: 'Register' }, { dispatch: dispatchTrackingData })(Register);