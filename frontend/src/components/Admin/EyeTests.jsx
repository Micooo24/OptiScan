import React, { useState, useEffect } from 'react';
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
import '../../CSS/EyeTests.css';
import AdminLayout from './AdminLayout';

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

export default function EyeTests() {
    const [dashboardData, setDashboardData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        fetchMonthlyData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/stats/dashboard');
            const data = await response.json();
            setDashboardData(data);
        } catch (error) {
            toast.error('Failed to fetch dashboard data');
            console.error('Error fetching dashboard data:', error);
        }
    };

    const fetchMonthlyData = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/monthly_diseases');
            const data = await response.json();
            setMonthlyData(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch monthly data');
            console.error('Error fetching monthly data:', error);
            setLoading(false);
        }
    };

    const data = dashboardData;

    // Create monthly chart data
    const createMonthlyChartData = () => {
        if (!monthlyData) return null;

        // Get all unique months from all test types
        const allMonths = new Set();
        
        Object.keys(monthlyData.colorblindness_abnormal || {}).forEach(month => allMonths.add(month));
        Object.keys(monthlyData.eye_tracking_abnormal || {}).forEach(month => allMonths.add(month));
        Object.keys(monthlyData.eye_scan_abnormal || {}).forEach(month => allMonths.add(month));

        // Sort months chronologically
        const sortedMonths = Array.from(allMonths).sort();

        // Create labels (format: "Jul 2025")
        const labels = sortedMonths.map(month => {
            const [year, monthNum] = month.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
        });

        // Create datasets
        const colorblindnessData = sortedMonths.map(month => 
            monthlyData.colorblindness_abnormal?.[month] || 0
        );
        
        const eyeTrackingData = sortedMonths.map(month => 
            monthlyData.eye_tracking_abnormal?.[month] || 0
        );
        
        const eyeScanData = sortedMonths.map(month => 
            monthlyData.eye_scan_abnormal?.[month] || 0
        );

        return {
            labels,
            datasets: [
                {
                    label: 'Colorblindness Abnormal',
                    data: colorblindnessData,
                    backgroundColor: '#3b82f6',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    borderRadius: 4,
                },
                {
                    label: 'Eye Tracking Abnormal',
                    data: eyeTrackingData,
                    backgroundColor: '#8b5cf6',
                    borderColor: '#8b5cf6',
                    borderWidth: 1,
                    borderRadius: 4,
                },
                {
                    label: 'Eye Scan Abnormal',
                    data: eyeScanData,
                    backgroundColor: '#ec4899',
                    borderColor: '#ec4899',
                    borderWidth: 1,
                    borderRadius: 4,
                }
            ]
        };
    };

    const monthlyChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                        weight: '500'
                    }
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    title: (tooltipItems) => {
                        return tooltipItems[0].label;
                    },
                    label: (context) => {
                        return `${context.dataset.label}: ${context.parsed.y} cases`;
                    }
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#64748b',
                    font: {
                        size: 12,
                        weight: '500'
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    color: '#64748b',
                    font: {
                        size: 12
                    },
                    stepSize: 1
                }
            }
        },
        elements: {
            bar: {
                borderSkipped: false,
            }
        }
    };

    const createOverviewBarData = (label, value, total, color) => ({
        labels: [label],
        datasets: [
            {
                label: label,
                data: [((value / (total || 1)) * 100).toFixed(2)],
                backgroundColor: color,
                borderRadius: 4,
                barThickness: 20,
                maxBarThickness: 25,
            }
        ]
    });

    const overviewOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                min: 0,
                max: 100,
                ticks: { callback: (val) => `${val}%` },
                grid: { color: 'rgba(0, 0, 0, 0.1)' }
            },
            y: {
                grid: { display: false }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.raw}%`
                }
            }
        }
    };

    if (loading) {
        return (
            <AdminLayout pageTitle="Eye Tests" initialTab="eye-tests">
                <div className="eye-tests-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading eye test data...</p>
                </div>
            </AdminLayout>
        );
    }

    const monthlyChartData = createMonthlyChartData();

    return (
        <AdminLayout pageTitle="Eye Tests" initialTab="eye-tests">
            <div className="eye-tests-container">
                {/* Header */}
                <div className="eye-tests-header">
                    <h1>Monthly Eye Test</h1>
                </div>

                {/* Main Content */}
                <div className="eye-tests-content">
                    {/* Chart Section */}
                    <div className="chart-section">
                        <div className="chart-container">
                            {monthlyChartData ? (
                                <Bar data={monthlyChartData} options={monthlyChartOptions} />
                            ) : (
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    height: '100%',
                                    color: '#64748b'
                                }}>
                                    No monthly data available
                                </div>
                            )}
                        </div>
                    </div>
                   
                    {/* Right Sidebar */}
                    <div className="sidebar">
                        {/* Stats Cards */}
                        <div className="stats-cards">
                            <div className="stat-card">
                                <div className="stat-number">{data?.total_tests || 0}</div>
                                <div className="stat-label">Total Tests</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">{data?.test_breakdown?.colorblindness_tests || 0}</div>
                                <div className="stat-label">Colorblind Test</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">{data?.test_breakdown?.eye_test_sessions || 0}</div>
                                <div className="stat-label">Eye Test</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">{data?.test_breakdown?.eye_scans || 0}</div>
                                <div className="stat-label">Eye Scan</div>
                            </div>
                        </div>

                        {/* Bottom Sections */}
                        <div className="bottom-sections">
                            {/* Overview */}
                            <div className="overview-section">
                                <h3>Overview</h3>
                                <div className="overview-items" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ height: '50px' }}>
                                        <Bar
                                            data={createOverviewBarData(
                                                'Colorblindness Abnormal',
                                                data?.disease_breakdown?.colorblindness_abnormal || 0,
                                                data?.test_breakdown?.colorblindness_tests || 1,
                                                '#3b82f6' // blue
                                            )}
                                            options={overviewOptions}
                                        />
                                    </div>
                                    <div style={{ height: '50px' }}>
                                        <Bar
                                            data={createOverviewBarData(
                                                'Eye Tracking Abnormal',
                                                data?.disease_breakdown?.eye_tracking_abnormal || 0,
                                                data?.test_breakdown?.eye_test_sessions || 1,
                                                '#8b5cf6' // purple
                                            )}
                                            options={overviewOptions}
                                        />
                                    </div>
                                    <div style={{ height: '50px' }}>
                                        <Bar
                                            data={createOverviewBarData(
                                                'Eye Scan Abnormal',
                                                data?.disease_breakdown?.eye_scan_abnormal || 0,
                                                data?.test_breakdown?.eye_scans || 1,
                                                '#ec4899' // pink
                                            )}
                                            options={overviewOptions}
                                        />
                                    </div>
                                    <div style={{ height: '50px' }}>
                                        <Bar
                                            data={createOverviewBarData(
                                                'Total Abnormal',
                                                data?.disease_breakdown?.total_abnormal_tests || 0,
                                                data?.total_tests || 1,
                                                '#06b6d4' // cyan
                                            )}
                                            options={overviewOptions}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}