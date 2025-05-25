import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainNavigator from './MainNavigator';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import PaymentScreen from '../screens/PaymentScreen';
import CommentsScreen from '../screens/CommentsScreen';

// Define the navigation parameter list
export type AppStackParamList = {
  Main: undefined;
  Subscription: undefined;
  PaymentScreen: { planId: string };
  Comments: { postId: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={MainNavigator} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      <Stack.Screen name="Comments" component={CommentsScreen} />
    </Stack.Navigator>
  );
}
