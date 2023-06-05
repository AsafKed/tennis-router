import React, { useEffect, useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { NavLink, useNavigate } from 'react-router-dom'
import { Alert } from '@mui/material';

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
                        <p> FocusApp </p>

                        <form>
                            <div>
                                <label htmlFor="email-address">
                                    Email address
                                </label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="Email address"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="password">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="Password"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div>
                                <button
                                    onClick={onLogin}
                                >
                                    Login
                                </button>
                                {error && <Alert severity="error">{error}</Alert>}
                            </div>
                        </form>

                        <p className="text-sm text-white text-center">
                            No account yet? {' '}
                            <NavLink to="/register">
                                Sign up
                            </NavLink>
                        </p>

                    </div>
                </section>
            </main>
        </>
    )
}

export default track({ page: 'Login' }, { dispatch: dispatchTrackingData })(Login)