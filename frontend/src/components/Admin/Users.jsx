import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import '../../CSS/users.css';

// Chart.js imports
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { toast } from 'react-hot-toast';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

export default function Users() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        area_chart: {},
        pie_chart: {},
        line_chart: []
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [editFormData, setEditFormData] = useState({
        username: '',
        email: '',
        age: '',
        gender: ''
    });

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/admin/all', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/stats/charts');
            const data = await response.json();
            if (response.ok) {
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Filter and sort users
    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.gender?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedUsers = React.useMemo(() => {
        let sortableUsers = [...filteredUsers];
        if (sortConfig.key) {
            sortableUsers.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableUsers;
    }, [filteredUsers, sortConfig]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setEditFormData({
            username: user.username,
            email: user.email,
            age: user.age,
            gender: user.gender || ''
        });
        setShowEditModal(true);
        toast.success('User details are ready for editing!');
    };

    const handleDelete = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        // Show loading toast
        const loadingToast = toast.loading('Updating user...');

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:8000/api/admin/user/update/${selectedUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: editFormData.username,
                    email: editFormData.email,
                    age: parseInt(editFormData.age),
                    gender: editFormData.gender
                })
            });

            if (response.ok) {
                toast.success('User updated successfully!', { id: loadingToast });
                setShowEditModal(false);
                fetchUsers(); // Refresh the users list
            } else {
                const errorData = await response.json();
                toast.error(`Error: ${errorData.detail}`, { id: loadingToast });
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Error updating user', { id: loadingToast });
        }
    };

    const handleDeleteConfirm = async () => {
        // Show loading toast
        const loadingToast = toast.loading('Deleting user...');

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:8000/api/admin/user/delete/${selectedUser.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                toast.success(`${selectedUser.username} deleted successfully!`, { id: loadingToast });
                setShowDeleteModal(false);
                fetchUsers(); // Refresh the users list
            } else {
                const errorData = await response.json();
                toast.error(`Error: ${errorData.detail}`, { id: loadingToast });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Error deleting user', { id: loadingToast });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Chart configurations
    const lineChartData = {
        labels: stats.line_chart.map(item => item.month),
        datasets: [
            {
                label: 'Users Registered',
                data: stats.line_chart.map(item => item.user_count),
                borderColor: '#4ECDC4',
                backgroundColor: 'rgba(78, 205, 196, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4ECDC4',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6
            }
        ]
    };

    const pieChartData = {
        labels: ['Male', 'Female'],
        datasets: [
            {
                data: [stats.pie_chart.male || 0, stats.pie_chart.female || 0],
                backgroundColor: ['#4ECDC4', '#95E1D3'],
                borderColor: ['#ffffff', '#ffffff'],
                borderWidth: 3,
                hoverOffset: 10
            }
        ]
    };

    const areaChartData = {
        labels: ['Colorblindness Tests', 'Eye Test Sessions', 'Eye Scans'],
        datasets: [
            {
                label: 'Test Count',
                data: [
                    stats.area_chart.colorblindness_tests || 0,
                    stats.area_chart.eye_test_sessions || 0,
                    stats.area_chart.eye_scans || 0
                ],
                backgroundColor: 'rgba(78, 205, 196, 0.3)',
                borderColor: '#4ECDC4',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4ECDC4',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 8,
                pointHoverRadius: 10
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    font: {
                        size: 12,
                        family: 'Inter, sans-serif'
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11
                    }
                }
            },
            y: {
                grid: {
                    color: '#f0f0f0'
                },
                ticks: {
                    font: {
                        size: 11
                    }
                }
            }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    padding: 20,
                    font: {
                        size: 12,
                        family: 'Inter, sans-serif'
                    }
                }
            }
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="users-container">
                    <div className="loading-spinner">Loading...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="users-container">
              

                {/* Charts Section */}
                <div className="charts-section">
                    <div className="chart-card">
                        <h3>Tests Overview</h3>
                        <div className="chart-container">
                            <Line key="area-chart" data={areaChartData} options={chartOptions} />
                        </div>
                    </div>

                    <div className="chart-card">
                        <h3>Gender Distribution</h3>
                        <div className="chart-container">
                            <Pie key="pie-chart" data={pieChartData} options={pieOptions} />
                        </div>
                    </div>

                    <div className="chart-card full-width">
                        <h3>User Registration Trend</h3>
                        <div className="chart-container">
                            <Line key="line-chart" data={lineChartData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Data Table Section */}
                <div className="table-section">
                    <div className="table-header">
                        <h2>Users List</h2>
                        <div className="table-controls">
                            <div className="search-container">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                                <span className="search-icon">🔍</span>
                            </div>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('id')} className="sortable">
                                        No. {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th>Image</th>
                                    <th onClick={() => handleSort('email')} className="sortable">
                                        Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('username')} className="sortable">
                                        Username {sortConfig.key === 'username' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('age')} className="sortable">
                                        Age {sortConfig.key === 'age' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('gender')} className="sortable">
                                        Gender {sortConfig.key === 'gender' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th onClick={() => handleSort('created_at')} className="sortable">
                                        Created At {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((user, index) => (
                                    <tr key={user.id}>
                                        <td>{indexOfFirstItem + index + 1}</td>
                                        <td>
                                            <div className="user-image">
                                                {user.img_path ? (
                                                    <img src={user.img_path} alt={user.username} />
                                                ) : (
                                                    <div className="no-image">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.username}</td>
                                        <td>{user.age}</td>
                                        <td>
                                            <span className={`gender-badge gender-${user.gender}`}>
                                                {user.gender || 'N/A'}
                                            </span>
                                        </td>
                                        <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => handleEdit(user)}
                                                    title="Edit User"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(user)}
                                                    title="Delete User"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="pagination">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="pagination-btn"
                        >
                            Previous
                        </button>

                        <div className="pagination-info">
                            Page {currentPage} of {totalPages} ({sortedUsers.length} total users)
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="pagination-btn"
                        >
                            Next
                        </button>
                    </div>
                </div>

                {/* Edit Modal */}
                {showEditModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal-header">
                                <h3>Edit User</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Username:</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={editFormData.username}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email:</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={editFormData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Age:</label>
                                        <input
                                            type="number"
                                            name="age"
                                            value={editFormData.age}
                                            onChange={handleInputChange}
                                            min="1"
                                            max="150"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Gender:</label>
                                        <select
                                            name="gender"
                                            value={editFormData.gender}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setShowEditModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="save-btn">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="modal-overlay">
                        <div className="modal modal-small">
                            <div className="modal-header">
                                <h3>Confirm Delete</h3>
                                <button
                                    className="close-btn"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete <strong>{selectedUser?.username}</strong>?</p>
                                <p className="warning-text">This action cannot be undone.</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="cancel-btn"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="delete-confirm-btn"
                                    onClick={handleDeleteConfirm}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}