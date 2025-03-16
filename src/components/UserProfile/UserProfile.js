import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const UserProfile = () => {
    const [userList, setUserList] = useState([]);
    const [taskList, setTaskList] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const { user } = useContext(UserContext);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const response = await axios.get('http://localhost:4000/users');
                if (user?.role === 'admin') {
                    setUserList(response.data.filter(usr => usr?.role !== 'admin'));
                } else {
                    setCurrentUser(user);
                    loadTasks(user?.id);
                }
            } catch (error) {
                console.error('Error retrieving users:', error);
            }
        };
        loadUsers();
    }, [user]);

    const loadTasks = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:4000/tasks?assignedTo=${userId}`);
            setTaskList(response.data);
        } catch (error) {
            console.error('Error retrieving tasks:', error);
        }
    };

    const viewHistory = (userId) => {
        setCurrentUser(userList.find(usr => usr?.id === userId));
        loadTasks(userId);
    };

    const validationSchema = Yup.object().shape({
        inputName: Yup.string().required('Name is required'),
        inputEmail: Yup.string().email('Invalid email').required('Email is required'),
        inputPassword: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        inputRole: Yup.string().required('Role is required'),
    });

    const handleUserSubmit = async (values, { resetForm }) => {
        try {
            await axios.post('http://localhost:4000/users', {
                name: values.inputName,
                email: values.inputEmail,
                password: values.inputPassword,
                role: values.inputRole,
            });

            const updatedUsers = await axios.get('http://localhost:4000/users');
            setUserList(updatedUsers.data.filter(usr => usr?.role !== 'admin'));
            setIsFormVisible(false);
            resetForm(); // Clears the form after submission
        } catch (error) {
            console.error('Error adding new user:', error);
        }
    };

    return (
        <div>
            <h2>User Profiles</h2>
            {user?.role === 'admin' && (
                <div>
                    <button onClick={() => setIsFormVisible(!isFormVisible)}>
                        {isFormVisible ? 'Cancel' : 'Add New User'}
                    </button>
                    {isFormVisible && (
                        <Formik
                            initialValues={{ inputName: '', inputEmail: '', inputPassword: '', inputRole: 'employee' }}
                            validationSchema={validationSchema}
                            onSubmit={handleUserSubmit}
                        >
                            {() => (
                                <Form>
                                    <div>
                                        <label>Name:</label>
                                        <Field type="text" name="inputName" />
                                        <ErrorMessage name="inputName" component="div" className="error" style={{ color: 'red' }}/>
                                    </div>
                                    <div>
                                        <label>Email:</label>
                                        <Field type="email" name="inputEmail" />
                                        <ErrorMessage name="inputEmail" component="div" className="error" style={{ color: 'red' }}/>
                                    </div>
                                    <div>
                                        <label>Password:</label>
                                        <Field type="password" name="inputPassword" />
                                        <ErrorMessage name="inputPassword" component="div" className="error" style={{ color: 'red' }} />
                                    </div>
                                    <div>
                                        <label>Role:</label>
                                        <Field as="select" name="inputRole">
                                            <option value="employee">Employee</option>
                                            <option value="admin">Admin</option>
                                        </Field>
                                        <ErrorMessage name="inputRole" component="div" className="error" style={{ color: 'red' }}/>
                                    </div>
                                    <button type="submit">Create User</button>
                                </Form>
                            )}
                        </Formik>
                    )}
                    <ul>
                        {userList.map(usr => (
                            <li key={usr?.id}>
                                <strong>Name:</strong> {usr?.name} <br />
                                <strong>Email:</strong> {usr?.email} <br />
                                <button onClick={() => viewHistory(usr?.id)}>Get History</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {user?.role !== 'admin' && (
                <div>
                    <h3>Tasks Assigned to {user?.name}</h3>
                    <ul>
                        {taskList.map(task => (
                            <li key={task.id}>
                                <strong>Title:</strong> {task.title} <br />
                                <strong>Description:</strong> {task.description} <br />
                                <strong>Status:</strong> {task.status}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {currentUser && user?.role === 'admin' && (
                <div>
                    <h3>Tasks Worked By {currentUser.name}</h3>
                    <ul>
                        {taskList.map(task => (
                            <li key={task.id}>
                                <strong>Title:</strong> {task.title} <br />
                                <strong>Description:</strong> {task.description} <br />
                                <strong>Status:</strong> {task.status}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
