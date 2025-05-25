import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { TradeScreen } from '../screens/TradeScreen';
import { PortfolioScreen } from '../screens/PortfolioScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { Icons } from '../components/ui/Icons';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1A1B1E',
          borderTopColor: '#2D2E32',
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#71717A',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Icons.home color={color} />,
        }}
      />
      <Tab.Screen
        name="Trade"
        component={TradeScreen}
        options={{
          tabBarIcon: ({ color }) => <Icons.trade color={color} />,
        }}
      />
      <Tab.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{
          tabBarIcon: ({ color }) => <Icons.portfolio color={color} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ color }) => <Icons.user color={color} />,
        }}
      />
    </Tab.Navigator>
  );
} 