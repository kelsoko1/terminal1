import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

interface CustomTheme {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
}

const lightTheme: CustomTheme = {
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: '#00C805',  // Green for positive financial indicators
    background: '#F7F9FC',
    card: '#FFFFFF',
    text: '#1A2138',
    border: '#E1E9F0',
    notification: '#0A84FF',
    error: '#FF3B30',
    success: '#00C805',
    warning: '#FF9500',
    info: '#0A84FF',
  },
};

const darkTheme: CustomTheme = {
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: '#00C805',  // Keep green for consistency
    background: '#121212',
    card: '#1E1E1E',
    text: '#F2F2F7',
    border: '#2C2C2E',
    notification: '#0A84FF',
    error: '#FF453A',
    success: '#00C805',
    warning: '#FF9F0A',
    info: '#0A84FF',
  },
};

interface ThemeContextType {
  theme: CustomTheme;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  toggleTheme: () => {},
  isDarkMode: false,
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
