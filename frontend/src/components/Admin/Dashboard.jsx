import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from './AdminLayout';
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
import '../../CSS/Dashboard.css';

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

export default function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState({
    total_users: 0,
    total_tests: 0,
    users_with_possible_disease: 0,
    average_confidence: 0,
    test_breakdown: {},
    disease_breakdown: {},
    health_percentage: 0,
    disease_percentage: 0
  });

  const [monthlyData, setMonthlyData] = useState({});
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Chart refs for PDF export
  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const statsResponse = await fetch('http://localhost:8000/api/admin/stats/dashboard');
      const statsData = await statsResponse.json();
      setDashboardStats(statsData);

      // Fetch monthly data
      const monthlyResponse = await fetch('http://localhost:8000/api/admin/monthly_diseases');
      const monthlyDataRes = await monthlyResponse.json();
      setMonthlyData(monthlyDataRes);

      // Fetch recent tests
      const recentResponse = await fetch('http://localhost:8000/api/admin/recent-tests');
      const recentData = await recentResponse.json();
      setRecentTests(recentData);

      setLoading(false);
      toast.success('Dashboard data loaded successfully');

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const generateDashboardPDF = async () => {
    try {
      setGeneratingPDF(true);
      toast.loading('Generating OptiScan Dashboard Analytics PDF...');

      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(24);
      doc.setTextColor(0, 123, 255);
      doc.text('OptiScan Dashboard Analytics', 105, 20, { align: 'center' });
      
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

      // Add dashboard summary statistics
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Dashboard Overview', 20, yPosition);
      yPosition += 20;

      doc.setFontSize(12);
      doc.text(`Total Users: ${dashboardStats.total_users.toLocaleString()}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Total Tests Conducted: ${dashboardStats.total_tests.toLocaleString()}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Users with Possible Disease: ${dashboardStats.users_with_possible_disease.toLocaleString()}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Average Confidence Level: ${dashboardStats.average_confidence}%`, 20, yPosition);
      yPosition += 20;

      // Test breakdown section
      if (dashboardStats.test_breakdown) {
        doc.setFontSize(14);
        doc.text('Test Breakdown:', 20, yPosition);
        yPosition += 15;
        
        doc.setFontSize(11);
        const testBreakdown = dashboardStats.test_breakdown;
        doc.text(`• Colorblindness Tests: ${testBreakdown.colorblindness_tests || 0}`, 30, yPosition);
        yPosition += 8;
        doc.text(`• Eye Test Sessions: ${testBreakdown.eye_test_sessions || 0}`, 30, yPosition);
        yPosition += 8;
        doc.text(`• Eye Scans: ${testBreakdown.eye_scans || 0}`, 30, yPosition);
        yPosition += 15;
      }

      // Disease breakdown section
      if (dashboardStats.disease_breakdown) {
        doc.setFontSize(14);
        doc.text('Disease Detection Summary:', 20, yPosition);
        yPosition += 15;
        
        doc.setFontSize(11);
        const diseaseBreakdown = dashboardStats.disease_breakdown;
        doc.text(`• Colorblindness Abnormal: ${diseaseBreakdown.colorblindness_abnormal || 0}`, 30, yPosition);
        yPosition += 8;
        doc.text(`• Eye Tracking Abnormal: ${diseaseBreakdown.eye_tracking_abnormal || 0}`, 30, yPosition);
        yPosition += 8;
        doc.text(`• Eye Scan Abnormal: ${diseaseBreakdown.eye_scan_abnormal || 0}`, 30, yPosition);
        yPosition += 8;
        doc.text(`• Total Abnormal Tests: ${diseaseBreakdown.total_abnormal_tests || 0}`, 30, yPosition);
        yPosition += 20;
      }

      // Capture and add line chart
      if (lineChartRef.current) {
        const lineChart = await captureChart(lineChartRef, 'Monthly Trends Analysis');
        
        if (lineChart && lineChart.imgData) {
          // Add new page for line chart
          doc.addPage();
          yPosition = 20;

          // Chart title
          doc.setFontSize(16);
          doc.setTextColor(0, 0, 0);
          doc.text(lineChart.title, 105, yPosition, { align: 'center' });
          
          // Chart image
          const imgWidth = 170;
          const imgHeight = 100;
          const xPosition = (doc.internal.pageSize.getWidth() - imgWidth) / 2;
          
          doc.addImage(lineChart.imgData, 'PNG', xPosition, yPosition + 10, imgWidth, imgHeight);

          // Add trend analysis
          yPosition += 130;
          doc.setFontSize(12);
          doc.text('Trend Analysis:', 20, yPosition);
          yPosition += 15;
          
          doc.setFontSize(11);
          const totalNormal = dashboardStats.total_users - dashboardStats.users_with_possible_disease;
          const diseaseRate = ((dashboardStats.users_with_possible_disease / dashboardStats.total_users) * 100).toFixed(1);
          
          doc.text(`• Overall Health Rate: ${((totalNormal / dashboardStats.total_users) * 100).toFixed(1)}%`, 30, yPosition);
          yPosition += 10;
          doc.text(`• Disease Detection Rate: ${diseaseRate}%`, 30, yPosition);
          yPosition += 10;
          doc.text(`• System Confidence: ${dashboardStats.average_confidence}%`, 30, yPosition);
        }
      }

      // Capture and add pie chart
      if (pieChartRef.current) {
        const pieChart = await captureChart(pieChartRef, 'Abnormal Results Distribution');
        
        if (pieChart && pieChart.imgData) {
          // Add new page for pie chart
          doc.addPage();
          yPosition = 20;

          // Chart title
          doc.setFontSize(16);
          doc.setTextColor(0, 0, 0);
          doc.text(pieChart.title, 105, yPosition, { align: 'center' });
          
          // Chart image
          const imgWidth = 150;
          const imgHeight = 110;
          const xPosition = (doc.internal.pageSize.getWidth() - imgWidth) / 2;
          
          doc.addImage(pieChart.imgData, 'PNG', xPosition, yPosition + 10, imgWidth, imgHeight);

          // Add distribution analysis
          yPosition += 140;
          doc.setFontSize(12);
          doc.text('Distribution Analysis:', 20, yPosition);
          yPosition += 15;
          
          doc.setFontSize(11);
          const diseaseBreakdown = dashboardStats.disease_breakdown || {};
          const total = dashboardStats.total_users;
          
          if (total > 0) {
            const normalPercentage = (((total - dashboardStats.users_with_possible_disease) / total) * 100).toFixed(1);
            const eyeTrackingPercentage = ((diseaseBreakdown.eye_tracking_abnormal / total) * 100).toFixed(1);
            const colorblindPercentage = ((diseaseBreakdown.colorblindness_abnormal / total) * 100).toFixed(1);
            const eyeScanPercentage = ((diseaseBreakdown.eye_scan_abnormal / total) * 100).toFixed(1);
            
            doc.text(`• Normal Results: ${normalPercentage}%`, 30, yPosition);
            yPosition += 10;
            doc.text(`• Possible Disease: ${eyeTrackingPercentage}%`, 30, yPosition);
            yPosition += 10;
            doc.text(`• Colorblind Results: ${colorblindPercentage}%`, 30, yPosition);
            yPosition += 10;
            doc.text(`• Abnormal Results: ${eyeScanPercentage}%`, 30, yPosition);
          }
        }
      }

      // Add insights and recommendations page
      doc.addPage();
      yPosition = 20;

      doc.setFontSize(16);
      doc.text('Key Insights & Recommendations', 105, yPosition, { align: 'center' });
      yPosition += 20;

      doc.setFontSize(14);
      doc.text('System Performance:', 20, yPosition);
      yPosition += 15;

      doc.setFontSize(11);
      const insights = [
        `Total system utilization: ${dashboardStats.total_tests} tests across ${dashboardStats.total_users} users`,
        `Detection efficiency: ${((dashboardStats.users_with_possible_disease / dashboardStats.total_tests) * 100).toFixed(1)}% abnormality rate`,
        `System reliability: ${dashboardStats.average_confidence}% average confidence`,
        `Most effective test: ${getMostEffectiveTest()}`,
        `Health screening coverage: ${((dashboardStats.total_users / (dashboardStats.total_users + 100)) * 100).toFixed(1)}% population reach`
      ];

      insights.forEach(insight => {
        doc.text(`• ${insight}`, 30, yPosition);
        yPosition += 10;
      });

      yPosition += 10;
      doc.setFontSize(14);
      doc.text('Recommendations:', 20, yPosition);
      yPosition += 15;

      doc.setFontSize(11);
      const recommendations = [
        'Continue monitoring monthly trends for pattern recognition',
        'Focus on early detection programs for high-risk populations',
        'Enhance system confidence through algorithm improvements',
        'Expand screening programs to reach more users',
        'Implement follow-up protocols for abnormal results'
      ];

      recommendations.forEach(rec => {
        doc.text(`• ${rec}`, 30, yPosition);
        yPosition += 10;
      });

      // Footer on all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        doc.text('OptiScan Dashboard Analytics', 105, 285, { align: 'center' });
      }

      // Save PDF
      const fileName = `optiscan-dashboard-analytics-${new Date().getTime()}.pdf`;
      doc.save(fileName);

      toast.success('Dashboard Analytics PDF generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error generating PDF report');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const getMostEffectiveTest = () => {
    const testBreakdown = dashboardStats.test_breakdown || {};
    const testTypes = {
      'Colorblindness Tests': testBreakdown.colorblindness_tests || 0,
      'Eye Test Sessions': testBreakdown.eye_test_sessions || 0,
      'Eye Scans': testBreakdown.eye_scans || 0
    };
    
    return Object.keys(testTypes).reduce((a, b) => testTypes[a] > testTypes[b] ? a : b);
  };

  // Filter and sort recent tests
  const filteredTests = recentTests.filter(test =>
    test.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.test_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.result.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTests = React.useMemo(() => {
    let sortableTests = [...filteredTests];
    if (sortConfig.key) {
      sortableTests.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTests;
  }, [filteredTests, sortConfig]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedTests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedTests.length / itemsPerPage);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getLineChartData = () => {
    if (!monthlyData || Object.keys(monthlyData).length === 0) {
      return { labels: [], datasets: [] };
    }

    const months = Object.keys(monthlyData.total_normal || {}).sort();
    const labels = months.map(month => {
      const date = new Date(month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short' });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Normal',
          data: months.map(month => monthlyData.total_normal?.[month] || 0),
          borderColor: '#4FC3F7',
          backgroundColor: 'rgba(79, 195, 247, 0.1)',
          tension: 0.4,
          fill: false,
          pointBackgroundColor: '#4FC3F7',
          pointBorderColor: '#4FC3F7',
          pointRadius: 4,
        },
        {
          label: 'Possible Disease',
          data: months.map(month => monthlyData.eye_tracking_abnormal?.[month] || 0),
          borderColor: '#81C784',
          backgroundColor: 'rgba(129, 199, 132, 0.1)',
          tension: 0.4,
          fill: false,
          pointBackgroundColor: '#81C784',
          pointBorderColor: '#81C784',
          pointRadius: 4,
        },
        {
          label: 'Colorblind',
          data: months.map(month => monthlyData.colorblindness_abnormal?.[month] || 0),
          borderColor: '#FFB74D',
          backgroundColor: 'rgba(255, 183, 77, 0.1)',
          tension: 0.4,
          fill: false,
          pointBackgroundColor: '#FFB74D',
          pointBorderColor: '#FFB74D',
          pointRadius: 4,
        },
        {
          label: 'Abnormal',
          data: months.map(month => monthlyData.eye_scan_abnormal?.[month] || 0),
          borderColor: '#F06292',
          backgroundColor: 'rgba(240, 98, 146, 0.1)',
          tension: 0.4,
          fill: false,
          pointBackgroundColor: '#F06292',
          pointBorderColor: '#F06292',
          pointRadius: 4,
        }
      ]
    };
  };

  const getPieChartData = () => {
    const diseaseBreakdown = dashboardStats.disease_breakdown || {};
    const totalNormal = dashboardStats.total_users - dashboardStats.users_with_possible_disease;

    return {
      labels: ['Normal', 'Possible Disease', 'Colorblind', 'Abnormal Results'],
      datasets: [{
        data: [
          totalNormal,
          diseaseBreakdown.eye_tracking_abnormal || 0,
          diseaseBreakdown.colorblindness_abnormal || 0,
          diseaseBreakdown.eye_scan_abnormal || 0
        ],
        backgroundColor: [
          '#4FC3F7',
          '#81C784',
          '#FFB74D',
          '#64B5F6'
        ],
        borderWidth: 0,
        hoverOffset: 4
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(0,0,0,0.1)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="dashboard-container">
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
          }}>Dashboard</h1>
          <button
            onClick={generateDashboardPDF}
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
            {generatingPDF ? 'Generating PDF...' : 'Export Analytics to PDF'}
          </button>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          {/* Stats Cards Row */}
          <div className="stats-row">
            <div className="stat-card total-users">
              <div className="stat-content">
                <h3>Total Users</h3>
                <p className="stat-number">{dashboardStats.total_users.toLocaleString()}</p>
              </div>
            </div>

            <div className="stat-card total-tests">
              <div className="stat-content">
                <h3>Total Tests</h3>
                <p className="stat-number">{dashboardStats.total_tests.toLocaleString()}</p>
              </div>
            </div>

            <div className="stat-card users-disease">
              <div className="stat-content">
                <h3>Users w. Disease</h3>
                <p className="stat-number">{dashboardStats.users_with_possible_disease.toLocaleString()}</p>
              </div>
            </div>

            <div className="stat-card average-confidence">
              <div className="stat-content">
                <h3>Average Confidence</h3>
                <p className="stat-number">{dashboardStats.average_confidence}%</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-row">
            <div className="chart-card line-chart-card">
              <div className="chart-header">
                <h3>Monthly Trends Analysis</h3>
              </div>
              <div className="chart-container">
                <Line 
                  ref={lineChartRef}
                  data={getLineChartData()} 
                  options={chartOptions} 
                />
              </div>
            </div>

            <div className="chart-card pie-chart-card">
              <div className="chart-header">
                <h3>Abnormal Results Distribution</h3>
              </div>
              <div className="chart-container">
                <Pie 
                  ref={pieChartRef}
                  data={getPieChartData()} 
                  options={pieOptions} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}