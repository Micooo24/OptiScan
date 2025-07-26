import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Container
} from '@mui/material';
import { Assessment, Visibility, PictureAsPdf, Palette, VerifiedUser, Devices } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import BASE_URL from './common/baseURL';

const features = [
  {
    icon: <Visibility sx={{ fontSize: 40, color: '#3498db' }} />,
    title: 'Eye Tracking Analysis',
    desc: 'Advanced real-time eye tracking and analysis. Generate detailed reports in PDF format.'
  },
  {
    icon: <Palette sx={{ fontSize: 40, color: '#5E81AC' }} />,
    title: 'Color Blindness Test',
    desc: 'Perform color blindness tests and receive comprehensive PDF reports.'
  },
  {
    icon: <VerifiedUser sx={{ fontSize: 40, color: '#3498db' }} />,
    title: 'Authentication',
    desc: 'Secure login and registration with modern authentication standards.'
  },
  {
    icon: <Devices sx={{ fontSize: 40, color: '#5E81AC' }} />,
    title: 'Eye Prediction via Mobile App',
    desc: 'Access eye prediction features directly from your mobile device.'
  },
  {
    icon: <Assessment sx={{ fontSize: 40, color: '#3498db' }} />,
    title: 'User Interface & Experience',
    desc: 'Intuitive, professional UI for seamless user experience.'
  }
];

function LandingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await axios.get(`${BASE_URL}/api/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          toast.error('Session expired, please login again');
        }
      }
      setLoading(false);
    };
    checkAuthStatus();
  }, []);

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
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #b4c9d7 100%)'
    }}>
      {/* Header */}
      <Paper elevation={0} sx={{
        bgcolor: '#fff',
        borderBottom: '1px solid #eee',
        py: 2,
        px: 0,
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#3498db', mr: 2 }}>O</Avatar>
            <Box>
              <Typography variant="h5" sx={{ color: '#3498db', fontWeight: 700 }}>OptiScan</Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>Eye Detection</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button href="/" sx={{ color: '#333', fontWeight: 500 }}>Home</Button>
            <Button href="/eye-conditions" sx={{ color: '#333', fontWeight: 500 }}>Eye Conditions</Button>
            <Button href="/about" sx={{ color: '#333', fontWeight: 500 }}>About</Button>
            <Button href="/contact" sx={{ color: '#333', fontWeight: 500 }}>Contact</Button>
          </Box>
          <Box>
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ color: '#333', fontWeight: 500 }}>Hi, {user.username}</Typography>
                <Button variant="contained" color="error" sx={{ borderRadius: 2 }}>Logout</Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button href="/login" variant="outlined" sx={{ color: '#3498db', borderColor: '#3498db', fontWeight: 500 }}>Login</Button>
                <Button href="/register" variant="contained" sx={{ bgcolor: '#3498db', color: '#fff', fontWeight: 500 }}>Register</Button>
              </Box>
            )}
          </Box>
        </Container>
      </Paper>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h3" sx={{ color: '#5E81AC', fontWeight: 700, mb: 2 }}>
              Advanced Eye Detection System
            </Typography>
            <Typography variant="h6" sx={{ color: '#4C566A', mb: 4 }}>
              Real-time tracking and intelligent analysis powered by computer vision. Stay on top of your eye health every step of the way.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" sx={{ bgcolor: '#3498db', color: '#fff', fontWeight: 600, px: 4, py: 1.5 }}>Try Demo</Button>
              <Button variant="outlined" sx={{ color: '#3498db', borderColor: '#3498db', fontWeight: 600, px: 4, py: 1.5 }}>Learn More</Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{
              p: 4,
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: '#fff'
            }}>
              <Avatar sx={{ bgcolor: '#3498db', width: 80, height: 80, mb: 2 }}>
                <Visibility sx={{ fontSize: 48 }} />
              </Avatar>
              <Typography variant="h6" sx={{ color: '#3498db', mb: 1 }}>Ready to scan</Typography>
              <Typography variant="body2" sx={{ color: '#4C566A' }}>Your vision matters!</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ textAlign: 'center', color: '#5E81AC', fontWeight: 700, mb: 4 }}>
          Key Features
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card elevation={2} sx={{ borderRadius: 4, bgcolor: '#fff', textAlign: 'center', py: 3 }}>
                <CardContent>
                  {feature.icon}
                  <Typography variant="h6" sx={{ color: '#3498db', fontWeight: 600, mt: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4C566A', mt: 1 }}>
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{
        py: 8,
        textAlign: 'center',
        bgcolor: '#3498db',
        borderRadius: 4,
        color: '#fff',
        mb: 6
      }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Ready to get started?
        </Typography>
        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
          Experience the future of eye health monitoring
        </Typography>
        <Button href="/register" variant="contained" sx={{
          bgcolor: '#fff',
          color: '#3498db',
          fontWeight: 600,
          px: 6,
          py: 2,
          fontSize: 18,
          borderRadius: 3,
          boxShadow: 2,
          '&:hover': {
            bgcolor: '#e0f2fe',
            color: '#5E81AC'
          }
        }}>
          Create Account
        </Button>
      </Container>

      {/* Footer */}
      <Box sx={{
        bgcolor: '#5E81AC',
        color: '#E5E9F0',
        py: 4,
        mt: 8,
        textAlign: 'center'
      }}>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          &copy; {new Date().getFullYear()} OptiScan. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default LandingPage;