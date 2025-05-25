import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { backendService } from '../services/backendService';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useTheme();

  const handleRegister = async () => {
    // Validate form
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const userData = {
        name,
        email,
        password,
        phoneNumber: phoneNumber || undefined, // Only include if provided
      };

      await backendService.register(userData);
      
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully. Please login.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Failed to register. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.headerContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.headerSubtitle, { color: colors.text }]}>
              Join WebTrader and start your investment journey
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name *</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border
                }
              ]}
              placeholder="Enter your full name"
              placeholderTextColor={colors.text + '80'}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border
                }
              ]}
              placeholder="Enter your email"
              placeholderTextColor={colors.text + '80'}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={[styles.label, { color: colors.text }]}>Phone Number (Optional)</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border
                }
              ]}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.text + '80'}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />

            <Text style={[styles.label, { color: colors.text }]}>Password *</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border
                }
              ]}
              placeholder="Create a password"
              placeholderTextColor={colors.text + '80'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={[styles.label, { color: colors.text }]}>Confirm Password *</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border
                }
              ]}
              placeholder="Confirm your password"
              placeholderTextColor={colors.text + '80'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: colors.primary }]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.text }]}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>
                  {' '}Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  headerContainer: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  registerButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
