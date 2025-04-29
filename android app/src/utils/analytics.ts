import * as Sentry from '@sentry/react-native';
import analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';

// Initialize error tracking
export function initializeErrorTracking(): void {
  Sentry.init({
    dsn: 'YOUR_SENTRY_DSN',
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    debug: __DEV__,
    tracesSampleRate: 1.0,
    enabled: !__DEV__,
  });
}

// Analytics events
export const Analytics = {
  // Screen tracking
  trackScreen(screenName: string, params?: object): void {
    analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
      ...params,
    });
  },

  // User actions
  trackEvent(eventName: string, params?: object): void {
    analytics().logEvent(eventName, {
      timestamp: Date.now(),
      platform: Platform.OS,
      ...params,
    });
  },

  // User properties
  setUserProperties(properties: object): void {
    Object.entries(properties).forEach(([key, value]) => {
      analytics().setUserProperty(key, String(value));
    });
  },

  // Custom metrics
  trackMetric(name: string, value: number): void {
    analytics().logEvent('custom_metric', {
      metric_name: name,
      metric_value: value,
      timestamp: Date.now(),
    });
  },

  // Performance tracking
  trackTiming(category: string, name: string, timeInMs: number): void {
    analytics().logEvent('performance_metric', {
      category,
      name,
      time_ms: timeInMs,
      timestamp: Date.now(),
    });
  },

  // Error tracking
  trackError(error: Error, context?: object): void {
    Sentry.captureException(error, {
      extra: context,
    });

    analytics().logEvent('app_error', {
      error_name: error.name,
      error_message: error.message,
      ...context,
    });
  },

  // User engagement
  trackEngagement(action: string, params?: object): void {
    analytics().logEvent('user_engagement', {
      action,
      timestamp: Date.now(),
      ...params,
    });
  },

  // Feature usage
  trackFeatureUsage(featureName: string, params?: object): void {
    analytics().logEvent('feature_usage', {
      feature_name: featureName,
      timestamp: Date.now(),
      ...params,
    });
  },

  // Transaction tracking
  trackTransaction(transactionId: string, params: {
    value: number;
    currency: string;
    type: string;
    status: string;
  }): void {
    analytics().logEvent('transaction', {
      transaction_id: transactionId,
      timestamp: Date.now(),
      ...params,
    });
  }
};

// Performance monitoring
export const Performance = {
  private static timers: { [key: string]: number } = {};

  static startTimer(timerName: string): void {
    this.timers[timerName] = Date.now();
  },

  static stopTimer(timerName: string, category: string): void {
    const startTime = this.timers[timerName];
    if (startTime) {
      const duration = Date.now() - startTime;
      Analytics.trackTiming(category, timerName, duration);
      delete this.timers[timerName];
    }
  },

  static async measureAsync<T>(
    name: string,
    category: string,
    operation: () => Promise<T>
  ): Promise<T> {
    this.startTimer(name);
    try {
      const result = await operation();
      return result;
    } finally {
      this.stopTimer(name, category);
    }
  }
};

// Usage tracking hooks
export function useTrackScreenView(screenName: string, params?: object): void {
  React.useEffect(() => {
    Analytics.trackScreen(screenName, params);
  }, [screenName, params]);
}

// Error boundary component
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    Analytics.trackError(error, {
      componentStack: errorInfo.componentStack,
    });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Something went wrong. Please try again.
          </Text>
          <Button
            title="Retry"
            onPress={() => this.setState({ hasError: false })}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
}); 