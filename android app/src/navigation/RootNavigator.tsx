import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '../theme/CustomThemeProvider';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import SplashScreen from '../screens/SplashScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Auth" component={AuthNavigator} />
          <Stack.Screen name="MainApp" component={AppNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
