import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const SignUp = () => {
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const history = useHistory();

    const handleUserSignUp = async (event) => {
        event.preventDefault();
        try {
            await axios.post('http://localhost:4000/users', {
                name: userName,
                email: userEmail,
                password: userPassword,
                role: 'employee',
            });
            history.push('/login');
        } catch (error) {
            console.error('Error during sign-up:', error);
        }
    };

    return (
        <div>
            <h2>Sign Up</h2>
            <form onSubmit={handleUserSignUp}>
                <label>
                    Name:
                    <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                </label>
                <label>
                    Email:
                    <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required />
                </label>
                <label>
                    Password:
                    <input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} required />
                </label>
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default SignUp;