import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import ScrumDetails from '../Scrum Details/ScrumDetails';
import { UserContext } from '../../context/UserContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const Dashboard = () => {
    const [scrumList, setScrumList] = useState([]);
    const [activeScrum, setActiveScrum] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [userList, setUserList] = useState([]);
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

    const validationSchema = Yup.object({
        scrumTitle: Yup.string().required('Scrum name is required'),
        taskName: Yup.string().required('Task title is required'),
        taskDetails: Yup.string().min(5, 'Description must be at least 5 characters').required('Task description is required'),
        taskProgress: Yup.string().required('Task status is required'),
        taskAssignee: Yup.string().required('Task must be assigned to a user'),
    });

    const handleScrumCreation = async (values, { resetForm }) => {
        try {
            const scrumResponse = await axios.post('http://localhost:4000/scrums', {
                name: values.scrumTitle,
            });
            const createdScrum = scrumResponse.data;

            await axios.post('http://localhost:4000/tasks', {
                title: values.taskName,
                description: values.taskDetails,
                status: values.taskProgress,
                scrumId: createdScrum.id,
                assignedTo: values.taskAssignee,
                history: [
                    {
                        status: values.taskProgress,
                        date: new Date().toISOString().split('T')[0],
                    },
                ],
            });

            const updatedScrums = await axios.get('http://localhost:4000/scrums');
            setScrumList(updatedScrums.data);
            setIsFormVisible(false);
            resetForm();
        } catch (error) {
            console.error('Error creating scrum:', error);
        }
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
                        <Formik
                            initialValues={{
                                scrumTitle: '',
                                taskName: '',
                                taskDetails: '',
                                taskProgress: 'To Do',
                                taskAssignee: '',
                            }}
                            validationSchema={validationSchema}
                            onSubmit={handleScrumCreation}
                        >
                            {({ isSubmitting }) => (
                                <Form>
                                    <div>
                                        <label>Scrum Name:</label>
                                        <Field type="text" name="scrumTitle" />
                                        <ErrorMessage name="scrumTitle" component="div" style={{ color: 'red' }} />
                                    </div>
                                    <div>
                                        <label>Task Title:</label>
                                        <Field type="text" name="taskName" />
                                        <ErrorMessage name="taskName" component="div" style={{ color: 'red' }} />
                                    </div>
                                    <div>
                                        <label>Task Description:</label>
                                        <Field type="text" name="taskDetails" />
                                        <ErrorMessage name="taskDetails" component="div" style={{ color: 'red' }} />
                                    </div>
                                    <div>
                                        <label>Task Status:</label>
                                        <Field as="select" name="taskProgress">
                                            <option value="To Do">To Do</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Done">Done</option>
                                        </Field>
                                        <ErrorMessage name="taskProgress" component="div" style={{ color: 'red' }} />
                                    </div>
                                    <div>
                                        <label>Assign To:</label>
                                        <Field as="select" name="taskAssignee">
                                            <option value="">Select a user</option>
                                            {userList.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name} ({user.email})
                                                </option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name="taskAssignee" component="div" style={{ color: 'red' }} />
                                    </div>
                                    <button type="submit" disabled={isSubmitting}>Create Scrum</button>
                                </Form>
                            )}
                        </Formik>
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
