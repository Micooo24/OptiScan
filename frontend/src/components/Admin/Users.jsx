import React, { useState, useEffect, useRef } from 'react';
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
import { jsPDF } from 'jspdf';

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
    const [generatingPDF, setGeneratingPDF] = useState(false);

    // Chart refs
    const testsOverviewRef = useRef(null);
    const genderDistributionRef = useRef(null);
    const ageDistributionRef = useRef(null);
    const registrationTrendRef = useRef(null);

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

    const generateChartsPDF = async () => {
        try {
            setGeneratingPDF(true);
            toast.loading('Generating OptiScan User Charts PDF report...');

            const doc = new jsPDF();
            
            // Header
            doc.setFontSize(24);
            doc.setTextColor(0, 123, 255);
            doc.text('OptiScan User Charts', 105, 20, { align: 'center' });
            
            // Date
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });

            let yPosition = 50;

            // Function to capture chart as image
            const captureChart = (chartRef, title) => {
                return new Promise((resolve) => {
                    if (chartRef.current) {
                        const canvas = chartRef.current.canvas;
                        const imgData = canvas.toDataURL('image/png');
                        resolve({ imgData, title });
                    } else {
                        resolve(null);
                    }
                });
            };

            // Add user summary statistics first
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text('User Analytics Summary', 20, yPosition);
            yPosition += 20;

            doc.setFontSize(12);
            doc.text(`Total Users: ${users.length}`, 20, yPosition);
            yPosition += 10;
            doc.text(`Male Users: ${stats.pie_chart.male || 0}`, 20, yPosition);
            yPosition += 10;
            doc.text(`Female Users: ${stats.pie_chart.female || 0}`, 20, yPosition);
            yPosition += 10;
            doc.text(`Total Tests Conducted: ${(stats.area_chart.colorblindness_tests || 0) + (stats.area_chart.eye_test_sessions || 0) + (stats.area_chart.eye_scans || 0)}`, 20, yPosition);
            yPosition += 20;

            // Capture all charts
            const chartPromises = [
                captureChart(testsOverviewRef, 'Tests Overview'),
                captureChart(genderDistributionRef, 'Gender Distribution'),
                captureChart(ageDistributionRef, 'Age Distribution'),
                captureChart(registrationTrendRef, 'User Registration Trend')
            ];

            const chartImages = await Promise.all(chartPromises);

            // Add charts to PDF
            for (let i = 0; i < chartImages.length; i++) {
                const chart = chartImages[i];
                if (chart && chart.imgData) {
                    // Add new page for each chart
                    doc.addPage();
                    yPosition = 20;

                    // Chart title
                    doc.setFontSize(16);
                    doc.setTextColor(0, 0, 0);
                    doc.text(chart.title, 105, yPosition, { align: 'center' });
                    
                    // Chart image
                    const imgWidth = 170;
                    const imgHeight = 100;
                    const xPosition = (doc.internal.pageSize.getWidth() - imgWidth) / 2;
                    
                    doc.addImage(chart.imgData, 'PNG', xPosition, yPosition + 10, imgWidth, imgHeight);

                    // Add statistics below chart
                    yPosition += 130;
                    doc.setFontSize(12);
                    doc.text('Analysis:', 20, yPosition);
                    yPosition += 10;

                    if (i === 0) { // Tests Overview
                        doc.setFontSize(10);
                        doc.text(`• Colorblindness Tests: ${stats.area_chart.colorblindness_tests || 0}`, 30, yPosition);
                        yPosition += 8;
                        doc.text(`• Eye Test Sessions: ${stats.area_chart.eye_test_sessions || 0}`, 30, yPosition);
                        yPosition += 8;
                        doc.text(`• Eye Scans: ${stats.area_chart.eye_scans || 0}`, 30, yPosition);
                        yPosition += 8;
                        doc.text(`• Total Test Count: ${(stats.area_chart.colorblindness_tests || 0) + (stats.area_chart.eye_test_sessions || 0) + (stats.area_chart.eye_scans || 0)}`, 30, yPosition);
                    } else if (i === 1) { // Gender Distribution
                        const totalUsers = (stats.pie_chart.male || 0) + (stats.pie_chart.female || 0);
                        const malePercentage = totalUsers > 0 ? ((stats.pie_chart.male || 0) / totalUsers * 100).toFixed(1) : 0;
                        const femalePercentage = totalUsers > 0 ? ((stats.pie_chart.female || 0) / totalUsers * 100).toFixed(1) : 0;
                        
                        doc.text(`• Male Users: ${stats.pie_chart.male || 0} (${malePercentage}%)`, 30, yPosition);
                        yPosition += 8;
                        doc.text(`• Female Users: ${stats.pie_chart.female || 0} (${femalePercentage}%)`, 30, yPosition);
                        yPosition += 8;
                        doc.text(`• Total Users: ${totalUsers}`, 30, yPosition);
                        yPosition += 8;
                        doc.text(`• Gender Distribution: ${malePercentage}% male, ${femalePercentage}% female`, 30, yPosition);
                    } else if (i === 2) { // Age Distribution
                        const ageGroups = [
                            { label: '18-25', count: users.filter(user => user.age >= 18 && user.age <= 25).length },
                            { label: '26-35', count: users.filter(user => user.age >= 26 && user.age <= 35).length },
                            { label: '36-45', count: users.filter(user => user.age >= 36 && user.age <= 45).length },
                            { label: '46-60', count: users.filter(user => user.age >= 46 && user.age <= 60).length },
                            { label: '60+', count: users.filter(user => user.age > 60).length }
                        ];
                        ageGroups.forEach((group, index) => {
                            const percentage = users.length > 0 ? ((group.count / users.length) * 100).toFixed(1) : 0;
                            doc.text(`• ${group.label} years: ${group.count} users (${percentage}%)`, 30, yPosition + (index * 8));
                        });
                        yPosition += 32;
                        const avgAge = users.length > 0 ? (users.reduce((sum, user) => sum + (user.age || 0), 0) / users.length).toFixed(1) : 0;
                        doc.text(`• Average Age: ${avgAge} years`, 30, yPosition);
                    } else if (i === 3) { // Registration Trend
                        doc.text(`• Total Registered Users: ${users.length}`, 30, yPosition);
                        yPosition += 8;
                        doc.text(`• Registration Trend: ${stats.line_chart.length} months tracked`, 30, yPosition);
                        yPosition += 8;
                        if (stats.line_chart.length > 0) {
                            const latestMonth = stats.line_chart[stats.line_chart.length - 1];
                            doc.text(`• Latest Month Activity: ${latestMonth.user_count} registrations`, 30, yPosition);
                        }
                    }
                }
            }

            // Add insights page
            doc.addPage();
            yPosition = 20;

            doc.setFontSize(16);
            doc.text('Key Insights & Demographics', 105, yPosition, { align: 'center' });
            yPosition += 20;

            doc.setFontSize(14);
            doc.text('User Demographics:', 20, yPosition);
            yPosition += 15;

            doc.setFontSize(11);
            const insights = [
                `Total registered users: ${users.length}`,
                `Gender ratio: ${stats.pie_chart.male || 0} male, ${stats.pie_chart.female || 0} female`,
                `Most active age group: ${getMostActiveAgeGroup()}`,
                `Total eye tests performed: ${(stats.area_chart.colorblindness_tests || 0) + (stats.area_chart.eye_test_sessions || 0) + (stats.area_chart.eye_scans || 0)}`,
                `User engagement: ${getEngagementRate()}% users have taken tests`
            ];

            insights.forEach(insight => {
                doc.text(`• ${insight}`, 30, yPosition);
                yPosition += 10;
            });

            // Footer on all pages
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
                doc.text('OptiScan User Charts', 105, 285, { align: 'center' });
            }

            // Save PDF
            const fileName = `optiscan-user-charts-${new Date().getTime()}.pdf`;
            doc.save(fileName);

            toast.success('PDF report generated successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Error generating PDF report');
        } finally {
            setGeneratingPDF(false);
        }
    };

    const getMostActiveAgeGroup = () => {
        const ageGroups = [
            { label: '18-25', count: users.filter(user => user.age >= 18 && user.age <= 25).length },
            { label: '26-35', count: users.filter(user => user.age >= 26 && user.age <= 35).length },
            { label: '36-45', count: users.filter(user => user.age >= 36 && user.age <= 45).length },
            { label: '46-60', count: users.filter(user => user.age >= 46 && user.age <= 60).length },
            { label: '60+', count: users.filter(user => user.age > 60).length }
        ];
        
        const mostActive = ageGroups.reduce((max, group) => group.count > max.count ? group : max);
        return `${mostActive.label} (${mostActive.count} users)`;
    };

    const getEngagementRate = () => {
        const totalTests = (stats.area_chart.colorblindness_tests || 0) + (stats.area_chart.eye_test_sessions || 0) + (stats.area_chart.eye_scans || 0);
        return users.length > 0 ? ((totalTests / users.length) * 100).toFixed(1) : 0;
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

    // Age distribution chart
    const ageDistributionData = {
        labels: ['18-25', '26-35', '36-45', '46-60', '60+'],
        datasets: [
            {
                label: 'Age Groups',
                data: [
                    users.filter(user => user.age >= 18 && user.age <= 25).length,
                    users.filter(user => user.age >= 26 && user.age <= 35).length,
                    users.filter(user => user.age >= 36 && user.age <= 45).length,
                    users.filter(user => user.age >= 46 && user.age <= 60).length,
                    users.filter(user => user.age > 60).length
                ],
                backgroundColor: [
                    'rgba(78, 205, 196, 0.8)',
                    'rgba(149, 225, 211, 0.8)',
                    'rgba(78, 205, 196, 0.6)',
                    'rgba(149, 225, 211, 0.6)',
                    'rgba(78, 205, 196, 0.4)'
                ],
                borderColor: [
                    '#4ECDC4',
                    '#95E1D3',
                    '#4ECDC4',
                    '#95E1D3',
                    '#4ECDC4'
                ],
                borderWidth: 2
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

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
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
                    },
                    stepSize: 1
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
                {/* Header with PDF Export */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: '32px',
                        fontWeight: '700',
                        color: '#2c3e50',
                        letterSpacing: '-0.5px'
                    }}>User Analytics</h1>
                    <button
                        onClick={generateChartsPDF}
                        disabled={generatingPDF}
                        style={{
                            backgroundColor: generatingPDF ? '#b0b0b0' : '#4ECDC4',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: generatingPDF ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease',
                            boxShadow: generatingPDF ? 'none' : '0 2px 8px rgba(78, 205, 196, 0.3)',
                            minWidth: 'fit-content',
                            height: '44px'
                        }}
                        onMouseEnter={(e) => {
                            if (!generatingPDF) {
                                e.target.style.backgroundColor = '#45B7B8';
                                e.target.style.transform = 'translateY(-1px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(78, 205, 196, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!generatingPDF) {
                                e.target.style.backgroundColor = '#4ECDC4';
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 8px rgba(78, 205, 196, 0.3)';
                            }
                        }}
                    >
                        <span style={{ fontSize: '16px' }}>
                            {generatingPDF ? '⏳' : '📊'}
                        </span>
                        {generatingPDF ? 'Generating PDF...' : 'Export Charts to PDF'}
                    </button>
                </div>

                {/* Charts Section - Updated to match Dashboard/Eye Tests layout */}
                <div className="charts-section">
                    {/* Charts Row - Single row with wider charts like Dashboard */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '30px',
                        marginBottom: '40px'
                    }}>
                        {/* Tests Overview Chart - Full width like Dashboard line chart */}
                        <div className="chart-card" style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '20px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e9ecef',
                            gridColumn: '1 / -1'
                        }}>
                            <div className="chart-header" style={{
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#2c3e50'
                                }}>Tests Overview</h3>
                            </div>
                            <div className="chart-container" style={{ height: '350px' }}>
                                <Line 
                                    ref={testsOverviewRef} 
                                    key="area-chart" 
                                    data={areaChartData} 
                                    options={chartOptions} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Second Row - 2 charts side by side */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '30px',
                        marginBottom: '40px'
                    }}>
                        <div className="chart-card" style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '20px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e9ecef'
                        }}>
                            <div className="chart-header" style={{
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#2c3e50'
                                }}>Gender Distribution</h3>
                            </div>
                            <div className="chart-container" style={{ height: '350px' }}>
                                <Pie 
                                    ref={genderDistributionRef} 
                                    key="pie-chart" 
                                    data={pieChartData} 
                                    options={pieOptions} 
                                />
                            </div>
                        </div>

                        <div className="chart-card" style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '20px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e9ecef'
                        }}>
                            <div className="chart-header" style={{
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#2c3e50'
                                }}>Age Distribution</h3>
                            </div>
                            <div className="chart-container" style={{ height: '350px' }}>
                                <Bar 
                                    ref={ageDistributionRef} 
                                    key="age-chart" 
                                    data={ageDistributionData} 
                                    options={barOptions} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Third Row - Single chart full width */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        marginBottom: '40px'
                    }}>
                        <div className="chart-card" style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '20px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e9ecef'
                        }}>
                            <div className="chart-header" style={{
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#2c3e50'
                                }}>User Registration Trend</h3>
                            </div>
                            <div className="chart-container" style={{ height: '350px' }}>
                                <Line 
                                    ref={registrationTrendRef} 
                                    key="line-chart" 
                                    data={lineChartData} 
                                    options={chartOptions} 
                                />
                            </div>
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
                                            style={{ color: 'black', backgroundColor: 'white' }}
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
                                            style={{ color: 'black', backgroundColor: 'white' }}
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
                                            style={{ color: 'black', backgroundColor: 'white' }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Gender:</label>
                                        <select
                                            name="gender"
                                            value={editFormData.gender}
                                            onChange={handleInputChange}
                                            style={{ color: 'black', backgroundColor: 'white' }}
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