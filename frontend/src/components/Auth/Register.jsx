import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  Avatar,
  Paper,
  InputLabel,
  FormControl,
  Select,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import BASE_URL from '../../common/baseURL';
import LogoImage from '../../assets/logo.png';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

const genders = [
  { value: '', label: 'Select gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
];

const validationSchema = Yup.object({
  username: Yup.string().required('Username is required').min(3, 'At least 3 characters'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required').min(6, 'At least 6 characters'),
  age: Yup.number().typeError('Age must be a number').required('Age is required').min(1).max(150),
  gender: Yup.string().oneOf(['male', 'female'], 'Select gender').required('Gender is required'),
});

function Register() {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        width: '1000px',
        minHeight: '600px',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: 4,
      }}>
        {/* Left: Registration Form */}
        <Box sx={{
          flex: 1,
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          bgcolor: '#fff'
        }}>
          <Typography variant="h4" sx={{ color: '#5E81AC', fontWeight: 700, mb: 1 }}>
            Create Your Account
          </Typography>
          <Typography variant="body1" sx={{ color: '#4C566A', mb: 3 }}>
            Welcome! Please enter your details.
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

          <Formik
            initialValues={{
              username: '',
              email: '',
              password: '',
              age: '',
              gender: '',
              img: null
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              setError('');
              setLoading(true);
              try {
                const formDataToSend = new FormData();
                formDataToSend.append('username', values.username);
                formDataToSend.append('email', values.email);
                formDataToSend.append('password', values.password);
                formDataToSend.append('age', values.age);
                formDataToSend.append('gender', values.gender);
                if (values.img) formDataToSend.append('img', values.img);

                await axios.post(`${BASE_URL}/api/users/register`, formDataToSend, {
                  headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Registration successful!');
                resetForm();
                setPreview(null);
              } catch (err) {
                setError(err.response?.data?.detail || 'Registration failed');
              }
              setLoading(false);
              setSubmitting(false);
            }}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              setFieldValue,
              isSubmitting
            }) => (
              <Form style={{ width: '100%' }}>
                <TextField
                  label="Username"
                  name="username"
                  value={values.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  required
                  autoFocus
                  error={Boolean(touched.username && errors.username)}
                  helperText={touched.username && errors.username}
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  required
                  error={Boolean(touched.email && errors.email)}
                  helperText={touched.email && errors.email}
                />
                <TextField
                  label="Age"
                  name="age"
                  type="number"
                  value={values.age}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  required
                  inputProps={{ min: 1, max: 150 }}
                  error={Boolean(touched.age && errors.age)}
                  helperText={touched.age && errors.age}
                />
                <FormControl fullWidth margin="normal" error={Boolean(touched.gender && errors.gender)}>
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select
                    labelId="gender-label"
                    name="gender"
                    value={values.gender}
                    label="Gender"
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    {genders.map((g) => (
                      <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>
                    ))}
                  </Select>
                  {touched.gender && errors.gender && (
                    <Typography variant="caption" color="error">{errors.gender}</Typography>
                  )}
                </FormControl>
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>Profile Image</Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    Upload Image
                    <input
                      type="file"
                      name="img"
                      accept="image/*"
                      hidden
                      onChange={e => {
                        setFieldValue('img', e.currentTarget.files[0]);
                        setPreview(e.currentTarget.files[0] ? URL.createObjectURL(e.currentTarget.files[0]) : null);
                      }}
                    />
                  </Button>
                  {preview && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                      <Avatar src={preview} sx={{ width: 56, height: 56 }} />
                    </Box>
                  )}
                </Box>
                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                  required
                  error={Boolean(touched.password && errors.password)}
                  helperText={touched.password && errors.password}
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
                  disabled={loading || isSubmitting}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign up'}
                </Button>
              </Form>
            )}
          </Formik>
          <Box sx={{ mt: 3, textAlign: 'center', color: '#5E81AC' }}>
            <Typography variant="body2">
              Already have an account? <a href="/login" style={{ color: '#5E81AC', textDecoration: 'underline' }}>Sign in</a>
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
            Join now and experience seamless eye health management. Your vision matters!
          </Typography>
          <Box sx={{
            width: 350,
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
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px'}}
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

export default Register;