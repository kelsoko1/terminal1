import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/CustomThemeProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SplashScreenProps {
  navigation: {
    reset: (config: { index: number; routes: Array<{ name: string }> }) => void;
  };
}

export default function SplashScreen({ navigation }: SplashScreenProps) {
  const { theme } = useTheme();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Wait for a minimum time to show splash screen
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if user is authenticated
        const token = await AsyncStorage.getItem('auth_token');
        
        // Navigate to appropriate screen
        navigation.reset({
          index: 0,
          routes: [{ name: token ? 'MainApp' : 'Auth' }],
        });
      } catch (error) {
        console.error('Error checking auth status:', error);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
      }
    };

    checkAuthStatus();
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.appName, { color: theme.colors.text }]}>WebTrader</Text>
        <Text style={[styles.tagline, { color: theme.colors.text }]}>
          Your Financial Future, Simplified
        </Text>
      </View>
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    opacity: 0.8,
  },
  loader: {
    position: 'absolute',
    bottom: 80,
  },
});
