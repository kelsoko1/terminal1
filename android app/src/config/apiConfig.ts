const ENV = {
  dev: {
    apiUrl: 'http://10.0.2.2:3000', // Android emulator points to localhost
  },
  staging: {
    apiUrl: 'https://staging-api.yourwebsite.com',
  },
  prod: {
    apiUrl: 'https://api.yourwebsite.com',
  },
};

const getEnvVars = (env = process.env.NODE_ENV || 'development') => {
  if (env === 'development') {
    return ENV.dev;
  } else if (env === 'staging') {
    return ENV.staging;
  } else if (env === 'production') {
    return ENV.prod;
  }
  return ENV.dev;
};

export default getEnvVars;
