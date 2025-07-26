import React, { useState, useEffect } from 'react';
import UserNavBar from './components/layouts/UserNavBar';
import axios from 'axios';
import BASE_URL from './common/baseURL';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Container, Box, Typography, Paper } from '@mui/material';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await axios.get(`${BASE_URL}/api/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          toast.error('Session expired, please login again');
          navigate('/');
        }
      } else {
        navigate('/');
      }
      setLoading(false);
    };
    checkAuthStatus();
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #b4c9d7 100%)'
      }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h6" color="#3498db">Loading...</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <>
      <UserNavBar />
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{
          bgcolor: 'rgba(255,255,255,0.97)',
          borderRadius: 4,
          boxShadow: '0 4px 24px rgba(52,152,219,0.10)',
          p: 4,
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center'
        }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#3498db', mb: 2, textAlign: 'left' }}>
            Welcome back, {user?.username || 'User'}!
          </Typography>
          <Typography variant="body1" sx={{ color: '#4C566A', fontSize: 18, mb: 2, textAlign: 'left' }}>
            Start scanning or explore your dashboard.
          </Typography>
        </Box>
      </Container>
    </>
  );
}