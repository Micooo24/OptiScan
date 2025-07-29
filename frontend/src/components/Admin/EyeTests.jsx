import React, { useState, useEffect, useRef } from 'react';
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
    const [generatingPDF, setGeneratingPDF] = useState(false);

    // Chart refs for PDF export
    const monthlyChartRef = useRef(null);
    const overviewChart1Ref = useRef(null);
    const overviewChart2Ref = useRef(null);
    const overviewChart3Ref = useRef(null);
    const overviewChart4Ref = useRef(null);

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

    const generateChartsPDF = async () => {
        try {
            setGeneratingPDF(true);
            toast.loading('Generating OptiScan Eye Tests PDF report...');

            const doc = new jsPDF();
            
            // Header
            doc.setFontSize(24);
            doc.setTextColor(0, 123, 255);
            doc.text('OptiScan Eye Tests', 105, 20, { align: 'center' });
            
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

            // Add summary statistics first
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text('Eye Test Statistics Summary', 20, yPosition);
            yPosition += 20;

            doc.setFontSize(12);
            doc.text(`Total Tests Conducted: ${dashboardData?.total_tests || 0}`, 20, yPosition);
            yPosition += 10;
            doc.text(`Colorblindness Tests: ${dashboardData?.test_breakdown?.colorblindness_tests || 0}`, 20, yPosition);
            yPosition += 10;
            doc.text(`Eye Test Sessions: ${dashboardData?.test_breakdown?.eye_test_sessions || 0}`, 20, yPosition);
            yPosition += 10;
            doc.text(`Eye Scans: ${dashboardData?.test_breakdown?.eye_scans || 0}`, 20, yPosition);
            yPosition += 10;
            doc.text(`Total Abnormal Tests: ${dashboardData?.disease_breakdown?.total_abnormal_tests || 0}`, 20, yPosition);
            yPosition += 20;

            // Capture monthly chart
            if (monthlyChartRef.current) {
                const monthlyChart = await captureChart(monthlyChartRef, 'Monthly Eye Test Trends');
                
                if (monthlyChart && monthlyChart.imgData) {
                    // Add new page for monthly chart
                    doc.addPage();
                    yPosition = 20;

                    // Chart title
                    doc.setFontSize(16);
                    doc.setTextColor(0, 0, 0);
                    doc.text(monthlyChart.title, 105, yPosition, { align: 'center' });
                    
                    // Chart image
                    const imgWidth = 170;
                    const imgHeight = 100;
                    const xPosition = (doc.internal.pageSize.getWidth() - imgWidth) / 2;
                    
                    doc.addImage(monthlyChart.imgData, 'PNG', xPosition, yPosition + 10, imgWidth, imgHeight);

                    // Add monthly data breakdown
                    yPosition += 130;
                    doc.setFontSize(12);
                    doc.text('Monthly Breakdown:', 20, yPosition);
                    yPosition += 10;
                    doc.text(`Colorblindness Abnormal Cases: ${dashboardData?.disease_breakdown?.colorblindness_abnormal || 0}`, 20, yPosition);
                    yPosition += 8;
                    doc.text(`Eye Tracking Abnormal Cases: ${dashboardData?.disease_breakdown?.eye_tracking_abnormal || 0}`, 20, yPosition);
                    yPosition += 8;
                    doc.text(`Eye Scan Abnormal Cases: ${dashboardData?.disease_breakdown?.eye_scan_abnormal || 0}`, 20, yPosition);
                }
            }

            // Add overview charts page
            doc.addPage();
            yPosition = 20;

            doc.setFontSize(16);
            doc.text('Overview Analysis', 105, yPosition, { align: 'center' });
            yPosition += 20;

            // Calculate percentages for display
            const colorblindPercentage = ((dashboardData?.disease_breakdown?.colorblindness_abnormal || 0) / (dashboardData?.test_breakdown?.colorblindness_tests || 1) * 100).toFixed(1);
            const eyeTrackingPercentage = ((dashboardData?.disease_breakdown?.eye_tracking_abnormal || 0) / (dashboardData?.test_breakdown?.eye_test_sessions || 1) * 100).toFixed(1);
            const eyeScanPercentage = ((dashboardData?.disease_breakdown?.eye_scan_abnormal || 0) / (dashboardData?.test_breakdown?.eye_scans || 1) * 100).toFixed(1);
            const totalAbnormalPercentage = ((dashboardData?.disease_breakdown?.total_abnormal_tests || 0) / (dashboardData?.total_tests || 1) * 100).toFixed(1);

            doc.setFontSize(12);
            doc.text('Abnormality Rates:', 20, yPosition);
            yPosition += 15;
            doc.text(`• Colorblindness Abnormal Rate: ${colorblindPercentage}%`, 30, yPosition);
            yPosition += 10;
            doc.text(`• Eye Tracking Abnormal Rate: ${eyeTrackingPercentage}%`, 30, yPosition);
            yPosition += 10;
            doc.text(`• Eye Scan Abnormal Rate: ${eyeScanPercentage}%`, 30, yPosition);
            yPosition += 10;
            doc.text(`• Overall Abnormal Rate: ${totalAbnormalPercentage}%`, 30, yPosition);
            yPosition += 20;

            // Add insights section
            doc.setFontSize(14);
            doc.text('Key Insights:', 20, yPosition);
            yPosition += 15;

            doc.setFontSize(11);
            const insights = [
                `Most common test type: ${getHighestTestType()}`,
                `Highest abnormality rate: ${getHighestAbnormalityType()}`,
                `Total patients screened: ${dashboardData?.total_tests || 0}`,
                `Detection efficiency: ${(100 - parseFloat(totalAbnormalPercentage)).toFixed(1)}% normal results`
            ];

            insights.forEach(insight => {
                doc.text(`• ${insight}`, 30, yPosition);
                yPosition += 8;
            });

            // Footer on all pages
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
                doc.text('OptiScan Eye Tests Dashboard', 105, 285, { align: 'center' });
            }

            // Save PDF
            const fileName = `optiscan-eye-tests-${new Date().getTime()}.pdf`;
            doc.save(fileName);

            toast.success('PDF report generated successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Error generating PDF report');
        } finally {
            setGeneratingPDF(false);
        }
    };

    const getHighestTestType = () => {
        const tests = dashboardData?.test_breakdown;
        if (!tests) return 'N/A';
        
        const testTypes = {
            'Colorblindness Tests': tests.colorblindness_tests || 0,
            'Eye Test Sessions': tests.eye_test_sessions || 0,
            'Eye Scans': tests.eye_scans || 0
        };
        
        return Object.keys(testTypes).reduce((a, b) => testTypes[a] > testTypes[b] ? a : b);
    };

    const getHighestAbnormalityType = () => {
        const abnormals = dashboardData?.disease_breakdown;
        const tests = dashboardData?.test_breakdown;
        if (!abnormals || !tests) return 'N/A';
        
        const rates = {
            'Colorblindness': (abnormals.colorblindness_abnormal || 0) / (tests.colorblindness_tests || 1),
            'Eye Tracking': (abnormals.eye_tracking_abnormal || 0) / (tests.eye_test_sessions || 1),
            'Eye Scan': (abnormals.eye_scan_abnormal || 0) / (tests.eye_scans || 1)
        };
        
        return Object.keys(rates).reduce((a, b) => rates[a] > rates[b] ? a : b);
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
                {/* Header with PDF Export */}
                <div className="eye-tests-header" style={{
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
                    }}>Monthly Eye Test</h1>
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

                {/* Main Content */}
                <div className="eye-tests-content">
                    {/* Chart Section */}
                    <div className="chart-section">
                        <div className="chart-container">
                            {monthlyChartData ? (
                                <Bar 
                                    ref={monthlyChartRef}
                                    data={monthlyChartData} 
                                    options={monthlyChartOptions} 
                                />
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
                                            ref={overviewChart1Ref}
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
                                            ref={overviewChart2Ref}
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
                                            ref={overviewChart3Ref}
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
                                            ref={overviewChart4Ref}
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