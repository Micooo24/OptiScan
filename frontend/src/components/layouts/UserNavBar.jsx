import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import BASE_URL from '../../common/baseURL';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Container,
  Menu,
  MenuItem,
  ListItemAvatar,
  ListItemText,
  ListItem,
  Divider
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// Import clinic images
import recImage from '../../assets/rec.jpeg';
import stlukeImage from '../../assets/stluke.jpg';
import mctImage from '../../assets/mct.jpg';
import asianImage from '../../assets/asian.jpg';
import aecImage from '../../assets/aec.jpg';

const clinics = [
  {
    image: recImage,
    name: "Roque Eye Clinic (REC)",
    location: "St. Luke's Medical Center, Global City",
    url: "https://eye.com.ph/contact-us/book/"
  },
  {
    image: stlukeImage,
    name: "Martinez Eye Clinic",
    location: "BGC, Taguig",
    url: "https://www.stlukes.com.ph/health-specialties-and-services/institutes-departments-centers-and-services/eye-institute"
  },
  {
    image: mctImage,
    name: "Medical Center Taguig",
    location: "Ophthalmology Department (Public)",
    url: "https://medicalcentertaguig.com/speciality/ophthalmology/"
  },
  {
    image: asianImage,
    name: "Asian Eye Institute",
    location: "Rockwell, Makati City",
    url: "https://asianeyeinstitute.com/"
  },
  {
    image: aecImage,
    name: "The American Eye Center",
    location: "Shangri‑La Plaza, Ortigas/Mandaluyong",
    url: "https://americaneye.com.ph/index.php/contact-us/#"
  }
];

export default function UserNavBar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorElTest, setAnchorElTest] = useState(null);
  const [anchorElClinic, setAnchorElClinic] = useState(null);
  const navigate = useNavigate();

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

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  // Dropdown handlers
  const handleTestMenu = (event) => setAnchorElTest(event.currentTarget);
  const handleClinicMenu = (event) => setAnchorElClinic(event.currentTarget);
  const handleCloseTest = () => setAnchorElTest(null);
  const handleCloseClinic = () => setAnchorElClinic(null);

  if (loading) {
    return (
      <Box sx={{ minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="#3498db">Loading...</Typography>
      </Box>
    );
  }

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #eee' }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0 }}>
          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#3498db', mr: 2 }}>O</Avatar>
            <Box>
              <Typography variant="h5" sx={{ color: '#3498db', fontWeight: 700 }}>OptiScan</Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>Eye Detection</Typography>
            </Box>
          </Box>
          {/* Navigation Links */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button href="/home" sx={{ color: '#333', fontWeight: 500 }}>Home</Button>
            <Button href="/eye-conditions" sx={{ color: '#333', fontWeight: 500 }}>Eye Conditions</Button>
            {/* Eye Test Dropdown */}
            <Box>
              <Button
                sx={{ color: '#333', fontWeight: 500 }}
                endIcon={<ArrowDropDownIcon />}
                onClick={handleTestMenu}
              >
                Eye Test
              </Button>
              <Menu anchorEl={anchorElTest} open={Boolean(anchorElTest)} onClose={handleCloseTest}>
                <MenuItem onClick={handleCloseTest} component="a" href="/eye-tracking">Eye Tracking</MenuItem>
                <MenuItem onClick={handleCloseTest} component="a" href="/colorblind-test">Color Blind</MenuItem>
              </Menu>
            </Box>
            {/* Clinics Dropdown with Images */}
            <Box>
              <Button
                sx={{ color: '#333', fontWeight: 500 }}
                endIcon={<ArrowDropDownIcon />}
                onClick={handleClinicMenu}
              >
                Clinics (NCR)
              </Button>
              <Menu
                anchorEl={anchorElClinic}
                open={Boolean(anchorElClinic)}
                onClose={handleCloseClinic}
                PaperProps={{ sx: { minWidth: 320 } }}
              >
                {clinics.map((clinic, idx) => (
                  <MenuItem
                    key={clinic.name}
                    component="a"
                    href={clinic.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleCloseClinic}
                    sx={{ alignItems: 'flex-start', py: 2 }}
                  >
                    <ListItem alignItems="flex-start" disableGutters sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar src={clinic.image} alt={clinic.name} variant="rounded" sx={{ width: 56, height: 56, mr: 2 }} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 700 }}>{clinic.name}</Typography>}
                        secondary={
                          <Typography sx={{ color: '#666', fontSize: 14 }}>{clinic.location}</Typography>
                        }
                      />
                    </ListItem>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Button href="/" sx={{ color: '#333', fontWeight: 500 }}>History</Button>
          </Box>
          {/* Auth Buttons */}
          <Box>
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ color: '#333', fontWeight: 500 }}>Hi, {user.username}</Typography>
                <Button variant="contained" color="error" sx={{ borderRadius: 2 }} onClick={handleLogout}>Logout</Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button href="/login" variant="outlined" sx={{ color: '#3498db', borderColor: '#3498db', fontWeight: 500 }}>Login</Button>
                <Button href="/register" variant="contained" sx={{ bgcolor: '#3498db', color: '#fff', fontWeight: 500 }}>Register</Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}