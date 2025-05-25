import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/CustomThemeProvider';
import Icon from '../components/Icon';
import {
  Home,
  LineChart,
  Wallet,
  Settings,
  Bell,
  Users
} from 'lucide-react-native';

import PortfolioScreen from '../screens/PortfolioScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import NewsScreen from '../screens/NewsScreen';
import WalletScreen from '../screens/WalletScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SocialFeedScreen from '../screens/SocialFeedScreen';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
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
            case 'Social':
              IconComponent = Users;
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
      <Tab.Screen name="Social" component={SocialFeedScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Settings" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
