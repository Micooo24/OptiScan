import React, { useState, useEffect } from 'react';
import UserNavBar from './components/layouts/UserNavBar';
import axios from 'axios';
import BASE_URL from './common/baseURL';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Container, Box, Typography, Paper, Button, Grid, Card, CardContent, CardMedia } from '@mui/material';

import eyeTrackImg from './assets/eye_track.png';
import colorBlindImg from './assets/color_blind.png';
import eyeDiseaseImg from './assets/eye_disease.png'

const tests = [
  {
    name: "Eye Tracking",
    img: eyeTrackImg,
    desc: "This test monitors your pupil dilation and eye movement patterns to help detect neurological issues, drug reactions, and fatigue. By analyzing how your eyes respond to visual stimuli, the system can provide insights into your cognitive health and alertness.",
    route: "/eye-tracking",
    btnText: "Go to Eye Tracking"
  },
  {
    name: "Color Blindness Test",
    img: colorBlindImg,
    desc: "This test identifies specific color vision deficiencies such as protanopia, deuteranopia, and tritanopia. The system uses advanced color plates and AI analysis to precisely type your color vision status, helping you understand how you perceive colors compared to others.",
    route: "/colorblind-test",
    btnText: "Go to Color Blindness Test"
  },
  {
    name: "Eye Prediction Test (Mobile)",
    img: eyeDiseaseImg,
    desc: "Using AI, this test analyzes fundus images or iris scans taken from your mobile device to detect early signs of diabetic retinopathy, glaucoma, macular degeneration, and cataracts. The system provides risk assessments and recommendations for further clinical evaluation, supporting proactive eye health management.",
    route: null,
    btnText: "Via React Native App"
  }
];


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
      <Container maxWidth="md" sx={{
        py: 6,
        height: 'calc(100vh - 100px)',
        overflowY: 'auto'
      }}>
        <Box sx={{
          bgcolor: 'rgba(255,255,255,0.97)',
          borderRadius: 4,
          boxShadow: '0 4px 24px rgba(52,152,219,0.10)',
          p: 4,
          mb: 4
        }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#3498db', mb: 2 }}>
            Welcome back, {user?.username || 'User'}!
          </Typography>
          <Typography variant="body1" sx={{ color: '#4C566A', fontSize: 18, mb: 2 }}>
            Start scanning or explore your dashboard.
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#3498db', mb: 3 }}>
          Available Eye Tests
        </Typography>
        <Grid container spacing={4}>
          {tests.map((test, idx) => (
            <Grid item xs={12} key={test.name}>
              <Card
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 6,
                    bgcolor: '#e0f2fe'
                  }
                }}
              >
                <CardMedia
                  component="img"
                  image={test.img}
                  alt={test.name}
                  sx={{
                    width: 120,
                    height: 80,
                    objectFit: 'cover',
                    borderRadius: 3,
                    m: 2,
                    bgcolor: '#e0f2fe'
                  }}
                />
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ color: '#3498db', fontWeight: 700 }}>
                    {test.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4C566A', mt: 1, mb: 2 }}>
                    {test.desc}
                  </Typography>
                  {test.route ? (
                    <Button
                      variant="contained"
                      sx={{
                        bgcolor: '#3498db',
                        color: '#fff',
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        boxShadow: 0,
                        '&:hover': { bgcolor: '#217dbb' }
                      }}
                      onClick={() => navigate(test.route)}
                    >
                      {test.btnText}
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      sx={{
                        color: '#3498db',
                        borderColor: '#3498db',
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        boxShadow: 0,
                        cursor: 'not-allowed'
                      }}
                      disabled
                    >
                      {test.btnText}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}