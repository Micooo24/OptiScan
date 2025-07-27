import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Container
} from '@mui/material';
import {
  Assessment,
  Visibility,
  Palette,
  VerifiedUser,
  Devices,
  PictureAsPdf,
  Security,
  Smartphone,
  ThumbUp,
  Speed,
  PeopleAlt
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import BASE_URL from './common/baseURL';

import eyeTrackImg from './assets/eye_track.png';
import authImg from './assets/auth.png';
import colorBlndImg from './assets/color_blind.png'
import eyeDiseaseImg from './assets/eye_disease.png'
import userexpImg from './assets/user_exp.png'

import chooseImg from './assets/choose.png'
import logoImg from './assets/logo.png'
import eyeGif from './assets/eye.gif';

const features = [
  {
    image: eyeTrackImg,
    title: 'Eye Tracking Analysis',
    desc: 'Advanced real-time eye tracking and analysis. Generate detailed reports in PDF format.'
  },
  {
    image: colorBlndImg,
    title: 'Color Blindness Test',
    desc: 'Perform color blindness tests and receive comprehensive PDF reports.'
  },
  {
    image: authImg,
    title: 'Authentication',
    desc: 'Secure login and registration with modern authentication standards.'
  },
  {
    image: eyeDiseaseImg, // Eye Prediction via Mobile App
    title: 'Eye Prediction via Mobile App',
    desc: 'Access eye prediction features directly from your mobile device.'
  },
  {
    image: userexpImg, // User Interface & Experience
    title: 'User Interface & Experience',
    desc: 'Intuitive, professional UI for seamless user experience.'
  }
];
const whyChooseIcons = [
  { icon: <Speed sx={{ fontSize: 28, color: '#3498db', mr: 1 }} />, text: 'Fast PDF Reporting' },
  { icon: <Security sx={{ fontSize: 28, color: '#5E81AC', mr: 1 }} />, text: 'Secure Authentication' },
  { icon: <Smartphone sx={{ fontSize: 28, color: '#3498db', mr: 1 }} />, text: 'Mobile App Integration' },
  { icon: <ThumbUp sx={{ fontSize: 28, color: '#5E81AC', mr: 1 }} />, text: 'User-Friendly Experience' }
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
            <Button href="/login" sx={{ color: '#333', fontWeight: 500 }}>Home</Button>
            <Button href="/login" sx={{ color: '#333', fontWeight: 500 }}>Eye Conditions</Button>
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
      
    {/* OptiScan AI Hero Section */}
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{
        bgcolor: 'rgba(255,255,255,0.97)',
        borderRadius: 4,
        boxShadow: '0 4px 24px rgba(52,152,219,0.10)',
        p: 4,
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Grid container spacing={4} direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
          {/* Left Side: OptiScan AI Text */}
          <Grid item xs={12} md={7}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              alignItems: 'flex-start',
              justifyContent: 'center',
              height: '100%'
            }}>
              <Typography variant="h2" sx={{
                fontWeight: 800,
                color: '#3498db',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                textShadow: '0 2px 8px #b4c9d7',
                fontSize: { xs: '2rem', md: '2.5rem' },
                textAlign: 'left'
              }}>
                <span role="img" aria-label="eye" style={{ fontSize: 40 }}></span> OptiScan AI
              </Typography>
              <Typography variant="h5" sx={{
                fontWeight: 700,
                color: '#4C566A',
                lineHeight: 1.3,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                textAlign: 'left'
              }}>
                Your Partner for Better Eye Care
              </Typography>
              <Typography variant="body1" sx={{
                color: '#4C566A',
                fontSize: { xs: 16, md: 17 },
                lineHeight: 1.6,
                textAlign: 'left'
              }}>
                Looking for an easier way to monitor your eye health?
              </Typography>
              <Typography variant="body1" sx={{
                color: '#4C566A',
                fontSize: { xs: 16, md: 17 },
                lineHeight: 1.6,
                textAlign: 'left'
              }}>
              Monitor your vision anytime with OptiScan AI.
              </Typography>
              <Typography variant="body1" sx={{
                color: '#3498db',
                fontWeight: 600,
                fontSize: { xs: 17, md: 18 },
                lineHeight: 1.5,
                textAlign: 'left'
              }}>
                Start now and give your eyes the attention they deserve!
              </Typography>
            </Box>
          </Grid>
          {/* Right Side: Animated Eye GIF */}
          <Grid item xs={12} md={5}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '300px'
            }}>
              <img
                src={eyeGif}
                alt="Animated Eye"
                style={{
                  width: '100%',
                  maxWidth: 280,
                  height: 'auto',
                  borderRadius: 16,
                  boxShadow: '0 8px 32px rgba(52,152,219,0.18)',
                  background: '#e0f2fe',
                  transition: 'transform 0.3s ease'
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>

      {/* Why Choose OptiScan */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center' }}>
          <img
            src={chooseImg}
            alt="Why Choose OptiScan"
            style={{
              width: 300,
              height: 200,
              marginBottom: 16,
              objectFit: 'cover',
              background: "#e0f2fe",
              borderRadius: 12,
              boxShadow: "0 4px 24px rgba(52,152,219,0.10)"
            }}
          />
          <Typography
            variant="h4"
            sx={{
              color: '#3498db',
              fontWeight: 800,
              mb: 2,
              letterSpacing: 1,
              textShadow: '0 2px 8px #b4c9d7'
            }}
          >
            Why Choose OptiScan?
          </Typography>
          <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            {whyChooseIcons.map((item, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                    px: 3,
                    py: 2,
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.7)',
                    boxShadow: '0 4px 24px rgba(52,152,219,0.10)',
                    fontWeight: 600,
                    fontSize: 17,
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #e0f2fe 60%, #b4c9d7 100%)',
                      boxShadow: '0 8px 32px rgba(52,152,219,0.18)',
                      transform: 'scale(1.07) translateY(-4px)'
                    }
                  }}
                >
                  {item.icon}
                  <Typography variant="body1" sx={{ color: '#3498db', fontWeight: 700, ml: 1, textShadow: '0 1px 4px #b4c9d7' }}>
                    {item.text}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Key Features */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" sx={{ textAlign: 'center', color: '#5E81AC', fontWeight: 700, mb: 4 }}>
          Key Features
        </Typography>
        <Grid container spacing={3} justifyContent="center" alignItems="stretch">
          {features.map((feature, idx) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={2.4}
              key={idx}
              sx={{
                display: 'flex',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.03)',
                  boxShadow: 6,
                  zIndex: 2
                }
              }}
            >
             <Card elevation={2} sx={{
                borderRadius: 4,
                bgcolor: '#fff',
                textAlign: 'center',
                py: 2,
                px: 1,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 220,
                transition: 'box-shadow 0.2s'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1 }}>
                    <img
                      src={feature.image}
                      alt={feature.title}
                      style={{
                        width: '100%',
                        maxWidth: 70,
                        height: 'auto',
                        maxHeight: 70,
                        borderRadius: 10,
                        marginBottom: 8,
                        background: "#e0f2fe",
                        objectFit: 'cover',
                        transition: 'box-shadow 0.2s'
                      }}
                    />
                  </Box>
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

      {/* Ready to get Started */}
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