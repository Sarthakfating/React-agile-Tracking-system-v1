import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const Login = () => {
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const history = useHistory();
    const { login } = useContext(UserContext);

    const handleUserLogin = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.get(`http://localhost:4000/users?email=${userEmail}&password=${userPassword}`);
            if (response.data.length > 0) {
                const loggedInUser = response.data[0];
                login(loggedInUser);
                history.push(loggedInUser.role === 'admin' ? '/' : '/profiles');
            } else {
                alert('Invalid email or password');
            }
        } catch (error) {
            console.error('Error during login:', error);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleUserLogin}>
                <label>
                    Email:
                    <input type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required />
                </label>
                <label>
                    Password:
                    <input type="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} required />
                </label>
                <button type="submit">Login</button>
            </form>
            <button onClick={() => history.push('/signup')}>Sign Up</button>
        </div>
    );
};

export default Login;
