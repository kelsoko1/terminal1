import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { useFxFutures } from '../../lib/hooks/useFxFutures';
import { FxFuture, FxExpiryDate } from '../../lib/services/futuresService';
import FxFuturesListReal from './FxFuturesListReal';
import FxFutureOrdersReal from './FxFutureOrdersReal';
import FxFutureTradesReal from './FxFutureTradesReal';

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
      id={`fx-trading-tabpanel-${index}`}
      aria-labelledby={`fx-trading-tab-${index}`}
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

export default function FxFutureTradingReal() {
  const {
    futures,
    loading,
    error,
    getExpiryDates
  } = useFxFutures();

  const [selectedFuture, setSelectedFuture] = useState<FxFuture | null>(null);
  const [selectedExpiryDate, setSelectedExpiryDate] = useState<FxExpiryDate | null>(null);
  const [expiryDates, setExpiryDates] = useState<FxExpiryDate[]>([]);
  const [loadingExpiryDates, setLoadingExpiryDates] = useState(false);
  const [expiryError, setExpiryError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Load futures when component mounts
  useEffect(() => {
    if (futures.length > 0 && !selectedFuture) {
      setSelectedFuture(futures[0]);
    }
  }, [futures, selectedFuture]);

  // Load expiry dates when a future is selected
  useEffect(() => {
    if (selectedFuture) {
      const fetchExpiryDates = async () => {
        setLoadingExpiryDates(true);
        setExpiryError(null);
        try {
          const response = await getExpiryDates(selectedFuture.id);
          setExpiryDates(response);
          // Select the first expiry date by default
          if (response.length > 0) {
            setSelectedExpiryDate(response[0]);
          } else {
            setSelectedExpiryDate(null);
          }
        } catch (err) {
          console.error('Error fetching expiry dates:', err);
          setExpiryError('Failed to load expiry dates');
          setExpiryDates([]);
          setSelectedExpiryDate(null);
        } finally {
          setLoadingExpiryDates(false);
        }
      };

      fetchExpiryDates();
    } else {
      setExpiryDates([]);
      setSelectedExpiryDate(null);
    }
  }, [selectedFuture, getExpiryDates]);

  const handleFutureSelect = (future: FxFuture) => {
    setSelectedFuture(future);
  };

  const handleExpiryDateSelect = (expiryDate: FxExpiryDate) => {
    setSelectedExpiryDate(expiryDate);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h1" gutterBottom>
              FX Futures Trading
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Trade FX futures with real-time market data and order matching.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              FX Futures
            </Typography>
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Currency Pair</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {futures.map((future) => (
                      <TableRow 
                        key={future.id}
                        hover
                        onClick={() => handleFutureSelect(future)}
                        selected={selectedFuture?.id === future.id}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{future.name}</TableCell>
                      </TableRow>
                    ))}
                    {futures.length === 0 && (
                      <TableRow>
                        <TableCell align="center">
                          No FX futures found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {selectedFuture && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Expiry Dates
              </Typography>
              {loadingExpiryDates ? (
                <CircularProgress size={24} />
              ) : expiryError ? (
                <Alert severity="error">{expiryError}</Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Expiry</TableCell>
                        <TableCell align="right">Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expiryDates.map((expiry) => (
                        <TableRow 
                          key={expiry.id}
                          hover
                          onClick={() => handleExpiryDateSelect(expiry)}
                          selected={selectedExpiryDate?.id === expiry.id}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>{expiry.displayName}</TableCell>
                          <TableCell align="right">
                            {(expiry.spotPrice + expiry.futurePremium).toFixed(4)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {expiryDates.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} align="center">
                            No expiry dates found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}
      </Grid>

      <Grid item xs={12} md={9}>
        {selectedExpiryDate ? (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {selectedFuture?.name} - {selectedExpiryDate.displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Current Price: {(selectedExpiryDate.spotPrice + selectedExpiryDate.futurePremium).toFixed(4)} | 
                Spot: {selectedExpiryDate.spotPrice.toFixed(4)} | 
                Premium: {selectedExpiryDate.futurePremium.toFixed(4)}
              </Typography>

              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="fx trading tabs">
                  <Tab label="Trading" id="fx-trading-tab-0" />
                  <Tab label="Market Trades" id="fx-trading-tab-1" />
                </Tabs>
              </Box>
              
              <TabPanel value={tabValue} index={0}>
                <FxFutureOrdersReal expiryDate={selectedExpiryDate} />
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <FxFutureTradesReal expiryDate={selectedExpiryDate} />
              </TabPanel>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <Typography variant="h6" color="text.secondary">
                  {selectedFuture 
                    ? "Select an expiry date to start trading" 
                    : "Select an FX future to view trading options"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Grid>
    </Grid>
  );
}
