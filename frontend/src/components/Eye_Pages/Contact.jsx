import React from 'react';
import { Container, Typography, Box, Paper, TextField, Button } from '@mui/material';

export default function Contact() {
  return (
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
  );
}