import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/CustomThemeProvider';
import { backendService } from '../services/backendService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogOut, User, Mail, Phone, Calendar, Edit, ChevronRight } from 'lucide-react-native';
import Icon from '../components/Icon';

interface ProfileScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    reset: (config: { index: number; routes: Array<{ name: string }> }) => void;
  };
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  createdAt: string;
  subscription?: {
    plan: string;
    status: string;
    expiresAt: string;
  };
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();

  const fetchProfile = async () => {
    try {
      const response = await backendService.getUserProfile();
      setProfile(response.data);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await backendService.logout();
              await AsyncStorage.removeItem('auth_token');
              await AsyncStorage.removeItem('refresh_token');
              await AsyncStorage.removeItem('user_info');
              
              // Navigate to Auth screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              setLoading(false);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { profile });
  };

  const handleSubscription = () => {
    navigation.navigate('Subscription');
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Image
              source={require('../../assets/avatar-placeholder.png')}
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={[styles.editImageButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleEditProfile}
            >
              <Icon icon={Edit} size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {profile?.name || 'User'}
          </Text>
          
          {profile?.subscription && (
            <View style={[styles.subscriptionBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.subscriptionText}>{profile.subscription.plan}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Personal Information
          </Text>
          
          <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon icon={User} size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Full Name</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {profile?.name || 'Not provided'}
                </Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon icon={Mail} size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Email</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {profile?.email || 'Not provided'}
                </Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon icon={Phone} size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Phone Number</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {profile?.phoneNumber || 'Not provided'}
                </Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon icon={Calendar} size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: theme.colors.text }]}>Member Since</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : 'Not available'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Subscription
          </Text>
          
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
            onPress={handleSubscription}
          >
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                {profile?.subscription
                  ? `${profile.subscription.plan} Plan`
                  : 'No Active Subscription'}
              </Text>
              <Text style={[styles.actionSubtitle, { color: theme.colors.text }]}>
                {profile?.subscription
                  ? `Expires on ${new Date(profile.subscription.expiresAt).toLocaleDateString()}`
                  : 'Subscribe to access premium features'}
              </Text>
            </View>
            <Icon icon={ChevronRight} size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
          onPress={handleLogout}
        >
          <Icon icon={LogOut} size={20} color="#FFFFFF" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subscriptionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  subscriptionText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 12,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoIconContainer: {
    width: 40,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 8,
  },
  actionCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
