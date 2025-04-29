import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from './src/components/Icon';
import {
  Home,
  LineChart,
  Wallet,
  Settings,
  Bell
} from 'lucide-react-native';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

import PortfolioScreen from './src/screens/PortfolioScreen';
import WatchlistScreen from './src/screens/WatchlistScreen';
import NewsScreen from './src/screens/NewsScreen';
import WalletScreen from './src/screens/WalletScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function MainNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let IconComponent;

          switch (route.name) {
            case 'Portfolio':
              IconComponent = Home;
              break;
            case 'Watchlist':
              IconComponent = LineChart;
              break;
            case 'News':
              IconComponent = Bell;
              break;
            case 'Wallet':
              IconComponent = Wallet;
              break;
            case 'Settings':
              IconComponent = Settings;
              break;
            default:
              IconComponent = Home;
          }

          return <Icon icon={IconComponent} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
      })}
    >
      <Tab.Screen name="Portfolio" component={PortfolioScreen} />
      <Tab.Screen name="Watchlist" component={WatchlistScreen} />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
} 