import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import BASE_URL from '../../common/baseURL';
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import LogoImage from '../../assets/logo.png';

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      toast.error('Please enter both email and password');
      setLoading(false);
      return;
    }

    const loadingToast = toast.loading('Logging in...');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);

      const response = await axios.post(`${BASE_URL}/api/users/login`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.dismiss(loadingToast);

      toast.success('Login successful! Welcome back!', {
        duration: 2000,
        style: {
          background: '#10b981',
          color: '#ffffff',
        },
      });

      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      if (response.data.user && response.data.user.role === 'admin') {
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      } else {
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      }

    } catch (err) {
      toast.dismiss(loadingToast);
      const errorMessage = err.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#ffffff',
        },
      });
    }
    setLoading(false);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #b4c9d7 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Paper elevation={0} sx={{
        display: 'flex',
        width: '900px',
        minHeight: '500px',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: 4,
        bgcolor: '#fff'
      }}>
        {/* Left: Login Form */}
        <Box sx={{
          flex: 1,
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          bgcolor: '#fff'
        }}>
          <Typography variant="h4" sx={{ color: '#5E81AC', fontWeight: 700, mb: 1 }}>
            Login
          </Typography>
          <Typography variant="body1" sx={{ color: '#4C566A', mb: 3 }}>
            Welcome back! Please enter your credentials.
          </Typography>

          {error && (
            <Box sx={{
              bgcolor: '#fdedec',
              color: '#e74c3c',
              borderRadius: 1,
              borderLeft: '4px solid #e74c3c',
              mb: 2,
              p: 1
            }}>
              {error}
            </Box>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              autoFocus
            />
              <TextField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />    
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 1, py: 1.5, fontWeight: 600, fontSize: 16, bgcolor: '#5E81AC' }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>
          <Box sx={{ mt: 3, textAlign: 'center', color: '#5E81AC' }}>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Don't have an account? <a href="/register" style={{ color: '#5E81AC', textDecoration: 'underline' }}>Register</a>
            </Typography>
          </Box>
        </Box>

        {/* Right: Placeholder Card */}
        <Box sx={{
          flex: 1,
          bgcolor: '#2E3440',
          color: '#E5E9F0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 5
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
            Welcome to OptiScan!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', maxWidth: 320 }}>
            Secure, fast, and smart login for your eye health management.
          </Typography>
          {/* Placeholder for chart or image */}
          <Box sx={{
            width: 300,
            height: 160,
            bgcolor: 'transparent',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            overflow: 'hidden'
          }}>
             <img
              src={LogoImage}
              alt="OptiScan"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '12px'
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: '#81A1C1', mt: 1 }}>
            Your data is secure and private.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default LoginPage;