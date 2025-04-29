import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import {
  User,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight,
  Moon,
  LogOut
} from 'lucide-react-native';

interface SettingItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description?: string;
  hasSwitch?: boolean;
  hasChevron?: boolean;
  onPress?: () => void;
}

const settingsSections = [
  {
    title: 'Account',
    items: [
      {
        id: 'profile',
        icon: User,
        title: 'Profile Information',
        description: 'Manage your personal information',
        hasChevron: true,
      },
      {
        id: 'notifications',
        icon: Bell,
        title: 'Notifications',
        description: 'Configure your notification preferences',
        hasChevron: true,
      },
      {
        id: 'security',
        icon: Shield,
        title: 'Security',
        description: 'Manage your security settings',
        hasChevron: true,
      }
    ]
  },
  {
    title: 'Preferences',
    items: [
      {
        id: 'darkMode',
        icon: Moon,
        title: 'Dark Mode',
        hasSwitch: true,
      },
      {
        id: 'help',
        icon: HelpCircle,
        title: 'Help & Support',
        description: 'Get help with your account',
        hasChevron: true,
      }
    ]
  }
];

export default function SettingsScreen() {
  const { colors } = useTheme();

  const SettingItemComponent = ({ item }: { item: SettingItem }) => {
    const Icon = item.icon;
    
    return (
      <TouchableOpacity
        style={[styles.settingItem, { backgroundColor: colors.card }]}
        onPress={item.onPress}
      >
        <View style={styles.settingItemLeft}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Icon size={20} color={colors.primary} />
          </View>
          <View style={styles.settingItemContent}>
            <Text style={[styles.settingItemTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            {item.description && (
              <Text style={[styles.settingItemDescription, { color: colors.text, opacity: 0.6 }]}>
                {item.description}
              </Text>
            )}
          </View>
        </View>
        
        {item.hasSwitch && (
          <Switch
            value={false}
            onValueChange={() => {}}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.card}
          />
        )}
        
        {item.hasChevron && (
          <ChevronRight size={20} color={colors.text} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {settingsSections.map((section, index) => (
        <View
          key={section.title}
          style={[
            styles.section,
            index > 0 && { marginTop: 24 }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {section.title}
          </Text>
          
          <View style={styles.sectionContent}>
            {section.items.map((item) => (
              <SettingItemComponent key={item.id} item={item} />
            ))}
          </View>
        </View>
      ))}

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.card }]}
      >
        <View style={styles.settingItemLeft}>
          <View style={[styles.iconContainer, { backgroundColor: '#FF5000' + '20' }]}>
            <LogOut size={20} color="#FF5000" />
          </View>
          <Text style={[styles.logoutText, { color: '#FF5000' }]}>
            Log Out
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingItemDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  logoutButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 