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
      id={`fx-future-tabpanel-${index}`}
      aria-labelledby={`fx-future-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function FxFuturesListReal() {
  const {
    futures,
    loading,
    error,
    getExpiryDates
  } = useFxFutures();

  const [selectedFuture, setSelectedFuture] = useState<FxFuture | null>(null);
  const [expiryDates, setExpiryDates] = useState<FxExpiryDate[]>([]);
  const [loadingExpiryDates, setLoadingExpiryDates] = useState(false);
  const [expiryError, setExpiryError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Load expiry dates when a future is selected
  useEffect(() => {
    if (selectedFuture) {
      const fetchExpiryDates = async () => {
        setLoadingExpiryDates(true);
        setExpiryError(null);
        
        try {
          const response = await getExpiryDates(selectedFuture.id);
          setExpiryDates(response);
        } catch (err) {
          console.error('Error fetching expiry dates:', err);
          setExpiryError('Failed to load expiry dates');
          setExpiryDates([]);
        } finally {
          setLoadingExpiryDates(false);
        }
      };

      fetchExpiryDates();
    } else {
      setExpiryDates([]);
    }
  }, [selectedFuture, getExpiryDates]);

  const handleFutureClick = (future: FxFuture) => {
    setSelectedFuture(future);
    setTabValue(0);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              FX Futures
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {loading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Currency Pair</TableCell>
                      <TableCell>Base</TableCell>
                      <TableCell>Quote</TableCell>
                      <TableCell align="right">Min Amount</TableCell>
                      <TableCell align="right">Tick Size</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {futures.map((future) => (
                      <TableRow 
                        key={future.id}
                        hover
                        onClick={() => handleFutureClick(future)}
                        selected={selectedFuture?.id === future.id}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{future.name}</TableCell>
                        <TableCell>{future.baseCurrency}</TableCell>
                        <TableCell>{future.quoteCurrency}</TableCell>
                        <TableCell align="right">{future.minAmount.toLocaleString()}</TableCell>
                        <TableCell align="right">{future.tickSize.toFixed(4)}</TableCell>
                      </TableRow>
                    ))}
                    {futures.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
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
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            {selectedFuture ? (
              <>
                <Typography variant="h6" gutterBottom>
                  {selectedFuture.name} Details
                </Typography>
                
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={handleTabChange} aria-label="fx future details tabs">
                    <Tab label="Expiry Dates" id="fx-future-tab-0" />
                    <Tab label="Orders" id="fx-future-tab-1" />
                    <Tab label="Trades" id="fx-future-tab-2" />
                  </Tabs>
                </Box>
                
                <TabPanel value={tabValue} index={0}>
                  {expiryError && <Alert severity="error" sx={{ mb: 2 }}>{expiryError}</Alert>}
                  {loadingExpiryDates ? (
                    <Box display="flex" justifyContent="center" my={4}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Expiry Date</TableCell>
                            <TableCell>Display Name</TableCell>
                            <TableCell align="right">Spot Price</TableCell>
                            <TableCell align="right">Future Premium</TableCell>
                            <TableCell align="right">Future Price</TableCell>
                            <TableCell align="right">Open Interest</TableCell>
                            <TableCell align="right">Volume</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {expiryDates.map((expiry) => (
                            <TableRow key={expiry.id}>
                              <TableCell>{new Date(expiry.date).toLocaleDateString()}</TableCell>
                              <TableCell>{expiry.displayName}</TableCell>
                              <TableCell align="right">{expiry.spotPrice.toFixed(4)}</TableCell>
                              <TableCell align="right">{expiry.futurePremium.toFixed(4)}</TableCell>
                              <TableCell align="right">{(expiry.spotPrice + expiry.futurePremium).toFixed(4)}</TableCell>
                              <TableCell align="right">{expiry.openInterest}</TableCell>
                              <TableCell align="right">{expiry.volume}</TableCell>
                            </TableRow>
                          ))}
                          {expiryDates.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={7} align="center">
                                No expiry dates found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </TabPanel>
                
                <TabPanel value={tabValue} index={1}>
                  <Typography>Orders functionality will be implemented here</Typography>
                </TabPanel>
                
                <TabPanel value={tabValue} index={2}>
                  <Typography>Trades functionality will be implemented here</Typography>
                </TabPanel>
              </>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                <Typography variant="h6" color="text.secondary">
                  Select an FX future to view details
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
