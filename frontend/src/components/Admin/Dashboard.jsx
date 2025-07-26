import React, { useState, useEffect } from 'react';
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

        {/* Main Content */}
        <div className="dashboard-content">
          {/* Charts Row */}
          {/* <div className="charts-row">
            <div className="chart-card line-chart-card">
              <div className="chart-header">
                <h3>Monthly Trends Analysis</h3>
              </div>
              <div className="chart-container">
                <Line data={getLineChartData()} options={chartOptions} />
              </div>
            </div>
            
            <div className="chart-card pie-chart-card">
              <div className="chart-header">
                <h3>Abnormal Results Distribution</h3>
              </div>
              <div className="chart-container">
                <Pie data={getPieChartData()} options={pieOptions} />
              </div>
            </div>
          </div> */}

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
                <Line data={getLineChartData()} options={chartOptions} />
              </div>
            </div>

            <div className="chart-card pie-chart-card">
              <div className="chart-header">
                <h3>Abnormal Results Distribution</h3>
              </div>
              <div className="chart-container">
                <Pie data={getPieChartData()} options={pieOptions} />
              </div>
            </div>
          </div>

          {/* Recent Tests Table */}
          {/* <div className="table-section">
            <div className="table-header">
              <h2>Recent Test Results</h2>
              <div className="table-controls">
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>
              </div>
            </div>

            <div className="table-container">
              <table className="recent-tests-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('email')} className="sortable">
                      Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('test_type')} className="sortable">
                      Test Type {sortConfig.key === 'test_type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('result')} className="sortable">
                      Result {sortConfig.key === 'result' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('date')} className="sortable">
                      Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((test, index) => (
                    <tr key={index}>
                      <td>{test.email}</td>
                      <td>{test.test_type}</td>
                      <td>
                        <span className={`result-badge ${test.result.toLowerCase().replace(/\s+/g, '-')}`}>
                          {test.result}
                        </span>
                      </td>
                      <td>{formatDate(test.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>

              <div className="pagination-info">
                Page {currentPage} of {totalPages} ({sortedTests.length} total tests)
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          </div> */}
        </div>


      </div>
    </AdminLayout>
  );
}