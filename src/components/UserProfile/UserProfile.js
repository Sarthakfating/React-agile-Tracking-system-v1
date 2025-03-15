import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';

const UserProfile = () => {
    const [userList, setUserList] = useState([]);
    const [taskList, setTaskList] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [inputName, setInputName] = useState('');
    const [inputEmail, setInputEmail] = useState('');
    const [inputPassword, setInputPassword] = useState('');
    const [inputRole, setInputRole] = useState('employee');
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

    const addUser = async (event) => {
        event.preventDefault();
        try {
            await axios.post('http://localhost:4000/users', {
                name: inputName,
                email: inputEmail,
                password: inputPassword,
                role: inputRole,
            });

            const updatedUsers = await axios.get('http://localhost:4000/users');
            setUserList(updatedUsers.data.filter(usr => usr?.role !== 'admin'));
            setIsFormVisible(false);
            setInputName('');
            setInputEmail('');
            setInputPassword('');
            setInputRole('employee');
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
                        <form onSubmit={addUser}>
                            <div>
                                <label>Name:</label>
                                <input
                                    type="text"
                                    value={inputName}
                                    onChange={(e) => setInputName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Email:</label>
                                <input
                                    type="email"
                                    value={inputEmail}
                                    onChange={(e) => setInputEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Password:</label>
                                <input
                                    type="password"
                                    value={inputPassword}
                                    onChange={(e) => setInputPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Role:</label>
                                <select
                                    value={inputRole}
                                    onChange={(e) => setInputRole(e.target.value)}
                                    required
                                >
                                    <option value="employee">Employee</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <button type="submit">Create User</button>
                        </form>
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