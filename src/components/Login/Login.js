import React, { useContext } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const Login = () => {
    const history = useHistory();
    const { login } = useContext(UserContext);

    // Yup validation schema
    const validationSchema = Yup.object({
        userEmail: Yup.string().email('Invalid email format').required('Email is required'),
        userPassword: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
    });

    // Form submission handler
    const handleUserLogin = async (values) => {
        try {
            const response = await axios.get(`http://localhost:4000/users?email=${values.userEmail}&password=${values.userPassword}`);
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
            <Formik
                initialValues={{ userEmail: '', userPassword: '' }}
                validationSchema={validationSchema}
                onSubmit={handleUserLogin}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <label>Email:</label>
                        <Field type="email" name="userEmail" />
                        <ErrorMessage name="userEmail" component="div" style={{ color: 'red' }} />

                        <label>Password:</label>
                        <Field type="password" name="userPassword" />
                        <ErrorMessage name="userPassword" component="div" style={{ color: 'red' }} />

                        <button type="submit" disabled={isSubmitting}>Login</button>
                    </Form>
                )}
            </Formik>
            <button onClick={() => history.push('/signup')}>Sign Up</button>
        </div>
    );
};

export default Login;
