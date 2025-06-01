import React, { useState } from 'react';
import { NextPage } from 'next';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { useSession } from 'next-auth/react';
import CommodityFuturesReal from '../../components/broker/commodities/CommodityFuturesReal';
import FxFutureTradingReal from '../../components/trading/FxFutureTradingReal';
import AccessDenied from '../../components/common/AccessDenied';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`futures-tabpanel-${index}`}
      aria-labelledby={`futures-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const FuturesPage: NextPage = () => {
  const { data: session, status } = useSession();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Show loading state
  if (status === 'loading') {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h4">Loading...</Typography>
        </Box>
      </Container>
    );
  }

  // Check if user is authenticated
  if (!session) {
    return <AccessDenied />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Futures Trading
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Trade commodity and FX futures with real-time market data and order matching.
        </Typography>

        <Paper sx={{ width: '100%', mt: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="futures trading tabs"
              sx={{ px: 2, pt: 2 }}
            >
              <Tab label="Commodity Futures" id="futures-tab-0" />
              <Tab label="FX Futures" id="futures-tab-1" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <CommodityFuturesReal />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <FxFutureTradingReal />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default FuturesPage;
