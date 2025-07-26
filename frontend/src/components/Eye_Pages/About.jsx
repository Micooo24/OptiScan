import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

export default function About() {
  return (
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
          <Typography variant="body1" sx={{ color: '#4C566A' }}>
            Start your journey to healthier eyes with OptiScan AI today!
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}