import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, TextField, Button, Avatar } from '@mui/material';

export default function Contact() {
  // Simulate user state for navbar (optional)
  const [user, setUser] = useState(null);

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #b4c9d7 100%)' }}>
      {/* Header Navbar */}
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

      {/* Contact Form */}
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#3498db', mb: 2 }}>
              Contact Us
            </Typography>
            <Typography variant="body1" sx={{ color: '#4C566A', mb: 3 }}>
              Have questions or feedback? Fill out the form below and we’ll get back to you soon.
            </Typography>
            <Box component="form">
              <TextField
                label="Your Name"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Your Email"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Message"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                sx={{ mb: 3 }}
              />
              <Button variant="contained" sx={{ bgcolor: '#3498db', color: '#fff', fontWeight: 600 }}>
                Send Message
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}