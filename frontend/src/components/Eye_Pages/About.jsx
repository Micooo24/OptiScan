import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Avatar,
  Container,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import BASE_URL from '../../common/baseURL';

export default function About() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      {/* Header Navbar (copied from LandingPage) */}
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

      {/* About Section */}
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#3498db', mb: 2 }}>
              About OptiScan AI
            </Typography>
            <Typography variant="body1" sx={{ color: '#4C566A', mb: 2 }}>
              OptiScan AI is an innovative platform designed to help users monitor and protect their eye health.
              Using advanced artificial intelligence, OptiScan AI offers easy-to-use tools for eye tracking, color blindness testing, and early detection of common eye conditions.
            </Typography>
            <Typography variant="body1" sx={{ color: '#4C566A', mb: 2 }}>
              Our mission is to make eye care accessible and convenient for everyone. Whether you want to check your vision, learn about eye diseases, or find trusted clinics, OptiScan AI is your partner for better eye care.
            </Typography>
            <Typography variant="body1" sx={{ color: '#4C566A', mb: 3 }}>
              Start your journey to healthier eyes with OptiScan AI today!
            </Typography>

            {/* Interactive FAQ Section */}
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#3498db', mb: 2 }}>
              Frequently Asked Questions
            </Typography>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 500 }}>What is OptiScan AI?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  OptiScan AI is a web platform that helps you monitor your eye health using AI-powered tools and resources.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 500 }}>Is OptiScan AI free to use?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Yes, you can use most features for free. Some advanced tools may require registration.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 500 }}>How do I get started?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Simply create an account or log in, then explore the available eye tests and resources.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}