import React from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const SignUp = () => {
    const history = useHistory();

    // Yup validation schema
    const validationSchema = Yup.object({
        userName: Yup.string().min(3, 'Name must be at least 3 characters').required('Name is required'),
        userEmail: Yup.string().email('Invalid email format').required('Email is required'),
        userPassword: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
    });

    // Form submission handler
    const handleUserSignUp = async (values) => {
        try {
            await axios.post('http://localhost:4000/users', {
                name: values.userName,
                email: values.userEmail,
                password: values.userPassword,
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
            <Formik
                initialValues={{ userName: '', userEmail: '', userPassword: '' }}
                validationSchema={validationSchema}
                onSubmit={handleUserSignUp}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <label>Name:</label>
                        <Field type="text" name="userName" />
                        <ErrorMessage name="userName" component="div" style={{ color: 'red' }} />

                        <label>Email:</label>
                        <Field type="email" name="userEmail" />
                        <ErrorMessage name="userEmail" component="div" style={{ color: 'red' }} />

                        <label>Password:</label>
                        <Field type="password" name="userPassword" />
                        <ErrorMessage name="userPassword" component="div" style={{ color: 'red' }} />

                        <button type="submit" disabled={isSubmitting}>Sign Up</button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default SignUp;
