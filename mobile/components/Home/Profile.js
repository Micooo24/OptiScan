import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Text, TextInput, Button, Card, ActivityIndicator, IconButton, Surface, Provider as PaperProvider, DefaultTheme, Menu, RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseURL from '../../assets/common/baseURL';

const { width, height } = Dimensions.get('window');

// Theme copied from Eye_Scan.js
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3b82f6',
    accent: '#1d4ed8',
  },
};

export default function Profile({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [img, setImg] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [token, setToken] = useState('');

  // Get authentication token from AsyncStorage
  const getAuthToken = async () => {
    try {
      // First try to get from loginResponse
      const loginResponse = await AsyncStorage.getItem('loginResponse');
      if (loginResponse) {
        const loginData = JSON.parse(loginResponse);
        if (loginData.access_token) {
          console.log('🔑 Token retrieved from loginResponse');
          return loginData.access_token;
        }
      }
      
      // Fallback to authToken key
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        console.log('🔑 Token retrieved from authToken');
        return token;
      }
      
      throw new Error('No authentication token found. Please login again.');
    } catch (error) {
      console.error('❌ Auth token error:', error);
      throw new Error('Authentication required. Please login again.');
    }
  };

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        const authToken = await getAuthToken();
        setToken(authToken);
      } catch (error) {
        console.error('Failed to get auth token:', error);
      }
    };
    initializeProfile();
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data.user);
        setUsername(res.data.user.username || '');
        setAge(res.data.user.age ? String(res.data.user.age) : '');
        setGender(res.data.user.gender || '');
        setImg(res.data.user.img_path || null);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [token]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.cancelled && result.assets) {
      setImg(result.assets[0].uri);
    } else if (!result.cancelled && result.uri) {
      setImg(result.uri);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const formData = new FormData();
      
      if (username) formData.append('username', username);
      if (age) formData.append('age', age);
      if (gender) formData.append('gender', gender);
      
      if (img && !img.startsWith('http')) {
        formData.append('img', {
          uri: img,
          name: 'profile.jpg',
          type: 'image/jpeg'
        });
      }

      const res = await axios.put(`${baseURL}/api/users/me/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProfile(res.data.user);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
      alert('Update failed: ' + (err.response?.data?.detail || err.message));
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <PaperProvider theme={theme}>
        <SafeAreaView style={styles.container}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
          </View>
        </SafeAreaView>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#1e3a8a', '#3b82f6']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Home')}
            >
              <IconButton
                icon="arrow-left"
                size={24}
                iconColor="#ffffff"
              />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <View style={styles.eyeIcon}>
                <View style={styles.eyeOuter}>
                  <View style={styles.eyeInner}>
                    <View style={styles.pupil} />
                  </View>
                </View>
              </View>
              <Text style={styles.headerTitle}>Profile</Text>
              <Text style={styles.headerSubtitle}>
                Update your information
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Image Card */}
          <Card style={styles.imageCard} elevation={3}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Profile Photo
              </Text>
              <View style={styles.imageContainer}>
                {img ? (
                  <Image source={{ uri: img }} style={styles.avatar} />
                ) : (
                  <Surface style={styles.avatarPlaceholder}>
                    <IconButton icon="account" size={48} color="#9ca3af" />
                    <Text>No Image</Text>
                  </Surface>
                )}
                <Button
                  mode="outlined"
                  icon="image-edit"
                  onPress={pickImage}
                  style={styles.imgBtn}
                  textColor={theme.colors.primary}
                >
                  Change Image
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Profile Information Card */}
          <Card style={styles.infoCard} elevation={3}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.cardTitle}>
                Personal Information
              </Text>
              
              <TextInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="account" />}
              />
              
              <TextInput
                label="Age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="calendar" />}
              />

              {/* Gender Selection using RadioButton */}
              <Text style={styles.genderLabel}>Gender</Text>
              <View style={styles.genderContainer}>
                {['male', 'female'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.genderOption,
                      gender === option && styles.genderSelected
                    ]}
                    onPress={() => setGender(option)}
                  >
                    <RadioButton
                      value={option}
                      status={gender === option ? 'checked' : 'unchecked'}
                      onPress={() => setGender(option)}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.genderText}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                mode="contained"
                onPress={handleUpdate}
                loading={updating}
                disabled={updating}
                style={styles.updateBtn}
                icon="content-save"
              >
                {updating ? "Updating..." : "Update Profile"}
              </Button>
            </Card.Content>
          </Card>

          {/* Current Info Card */}
          {profile && (
            <Card style={styles.currentInfoCard} elevation={2}>
              <Card.Title 
                title="Current Info" 
                left={(props) => <IconButton {...props} icon="information" color={theme.colors.primary} />} 
              />
              <Card.Content>
                <Text style={styles.infoText}>Username: {profile.username}</Text>
                <Text style={styles.infoText}>Age: {profile.age}</Text>
                <Text style={styles.infoText}>Email: {profile.email}</Text>
                <Text style={styles.infoText}>Gender: {profile.gender}</Text>
                <Text style={styles.infoText}>Role: {profile.role}</Text>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    height: height * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  eyeIcon: {
    marginBottom: 10,
  },
  eyeOuter: {
    width: 50,
    height: 35,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  eyeInner: {
    width: 38,
    height: 24,
    backgroundColor: '#e0f2fe',
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pupil: {
    width: 12,
    height: 12,
    backgroundColor: '#1e3a8a',
    borderRadius: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#e0f2fe',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  imageCard: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  infoCard: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  currentInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  cardTitle: {
    color: '#1e40af',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  imageContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  imgBtn: {
    alignSelf: 'center',
    marginVertical: 8,
    borderColor: '#3b82f6',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#f8fafc',
  },
  genderLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    marginTop: 5,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    minWidth: 120,
    justifyContent: 'center',
  },
  genderSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  genderText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  updateBtn: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    paddingVertical: 4,
  },
});