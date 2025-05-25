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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { backendService } from '../services/backendService';

interface NavigationProps {
  navigate: (screen: string) => void;
  goBack: () => void;
}

export default function ForgotPasswordScreen({ navigation }: { navigation: NavigationProps }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { colors } = useTheme();

  const handleResetPassword = async () => {
    // Validate email
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await backendService.resetPassword(email);
      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Reset password error:', error);
      let errorMessage = 'Failed to process your request. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      Alert.alert('Error', errorMessage);
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
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Forgot Password
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.text }]}>
              {isSubmitted
                ? 'Check your email for instructions to reset your password.'
                : 'Enter your email address and we\'ll send you instructions to reset your password.'}
            </Text>
          </View>

          {!isSubmitted ? (
            <View style={styles.formContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={colors.text + '80'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
              />

              <TouchableOpacity
                style={[styles.resetButton, { backgroundColor: colors.primary }]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.resetButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.resetButtonText}>Back to Login</Text>
            </TouchableOpacity>
          )}

          {!isSubmitted && (
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.backToLoginText, { color: colors.primary }]}>
                Back to Login
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
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
    lineHeight: 22,
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
    marginBottom: 24,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  resetButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backToLoginButton: {
    alignSelf: 'center',
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
