import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ScrumDetails from '../Scrum Details/ScrumDetails';
import { UserContext } from '../../context/UserContext';

const Dashboard = () => {
    const [scrumList, setScrumList] = useState([]);
    const [activeScrum, setActiveScrum] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [userList, setUserList] = useState([]);
    const [scrumTitle, setScrumTitle] = useState('');
    const [taskName, setTaskName] = useState('');
    const [taskDetails, setTaskDetails] = useState('');
    const [taskProgress, setTaskProgress] = useState('To Do');
    const [taskAssignee, setTaskAssignee] = useState('');
    const { user } = useContext(UserContext);

    useEffect(() => {
        const fetchScrumTeams = async () => {
            try {
                const response = await axios.get('http://localhost:4000/scrums');
                setScrumList(response.data);
            } catch (error) {
                console.error('Error retrieving scrum data:', error);
            }
        };

        const fetchAllUsers = async () => {
            try {
                const response = await axios.get('http://localhost:4000/users');
                setUserList(response.data);
            } catch (error) {
                console.error('Error retrieving user data:', error);
            }
        };

        fetchScrumTeams();
        fetchAllUsers();
    }, []);

    const fetchScrumDetails = async (scrumId) => {
        try {
            const response = await axios.get(`http://localhost:4000/scrums/${scrumId}`);
            setActiveScrum(response.data);
        } catch (error) {
            console.error('Error retrieving scrum details:', error);
        }
    };

    const handleScrumCreation = async (event) => {
        event.preventDefault();

        try {
            const scrumResponse = await axios.post('http://localhost:4000/scrums', {
                name: scrumTitle,
            });
            const createdScrum = scrumResponse.data;

            await axios.post('http://localhost:4000/tasks', {
                title: taskName,
                description: taskDetails,
                status: taskProgress,
                scrumId: createdScrum.id,
                assignedTo: taskAssignee,
                history: [
                    {
                        status: taskProgress,
                        date: new Date().toISOString().split('T')[0],
                    },
                ],
            });

            const updatedScrums = await axios.get('http://localhost:4000/scrums');
            setScrumList(updatedScrums.data);
            setIsFormVisible(false);
            resetFormFields();
        } catch (error) {
            console.error('Error creating scrum:', error);
        }
    };

    const resetFormFields = () => {
        setScrumTitle('');
        setTaskName('');
        setTaskDetails('');
        setTaskProgress('To Do');
        setTaskAssignee('');
    };

    return (
        <div>
            <h2>Scrum Teams</h2>
            {user?.role === 'admin' && (
                <div>
                    <button onClick={() => setIsFormVisible(!isFormVisible)}>
                        {isFormVisible ? 'Cancel' : 'Add New Scrum'}
                    </button>
                    {isFormVisible && (
                        <form onSubmit={handleScrumCreation}>
                            <div>
                                <label>Scrum Name:</label>
                                <input
                                    type="text"
                                    value={scrumTitle}
                                    onChange={(e) => setScrumTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Task Title:</label>
                                <input
                                    type="text"
                                    value={taskName}
                                    onChange={(e) => setTaskName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Task Description:</label>
                                <input
                                    type="text"
                                    value={taskDetails}
                                    onChange={(e) => setTaskDetails(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Task Status:</label>
                                <select
                                    value={taskProgress}
                                    onChange={(e) => setTaskProgress(e.target.value)}
                                    required
                                >
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                            <div>
                                <label>Assign To:</label>
                                <select
                                    value={taskAssignee}
                                    onChange={(e) => setTaskAssignee(e.target.value)}
                                    required
                                >
                                    <option value="">Select a user</option>
                                    {userList.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit">Create Scrum</button>
                        </form>
                    )}
                </div>
            )}
            <ul>
                {scrumList.map((scrum) => (
                    <li key={scrum.id}>
                        {scrum.name}
                        <button onClick={() => fetchScrumDetails(scrum.id)}>View Details</button>
                    </li>
                ))}
            </ul>
            {activeScrum && <ScrumDetails scrum={activeScrum} />}
        </div>
    );
};

export default Dashboard;
