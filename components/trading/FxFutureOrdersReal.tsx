import React, { useState, useEffect } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Divider
} from '@mui/material';
import { useFxFuturesTrading } from '../../lib/hooks/useFuturesTrading';
import { FxExpiryDate, FxFutureOrder } from '../../lib/services/futuresService';

interface OrderFormProps {
  expiryDate: FxExpiryDate;
  onSubmit: (data: { side: 'BUY' | 'SELL'; price: number; quantity: number }) => Promise<void>;
  disabled?: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({ expiryDate, onSubmit, disabled }) => {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [price, setPrice] = useState<number>(expiryDate.spotPrice + expiryDate.futurePremium);
  const [quantity, setQuantity] = useState<number>(expiryDate.fxFuture?.minAmount || 1000);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update price when expiry date changes
  useEffect(() => {
    setPrice(expiryDate.spotPrice + expiryDate.futurePremium);
    setQuantity(expiryDate.fxFuture?.minAmount || 1000);
  }, [expiryDate]);

  // Function to snap price to valid tick size
  const snapToTickSize = (inputPrice: number): number => {
    const tickSize = expiryDate.fxFuture?.tickSize || 0.0001;
    return Math.round(inputPrice / tickSize) * tickSize;
  };

  // Handle price change with tick size validation
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = Number(e.target.value);
    setPrice(newPrice);
  };

  // Snap price to valid tick size on blur
  const handlePriceBlur = () => {
    setPrice(snapToTickSize(price));
  };

  const handleSubmit = async () => {
    if (price <= 0 || quantity <= 0) {
      setError('Price and quantity must be positive values');
      return;
    }
    
    // Validate price against tick size
    const tickSize = expiryDate.fxFuture?.tickSize || 0.0001;
    const snappedPrice = snapToTickSize(price);
    
    if (price !== snappedPrice) {
      setPrice(snappedPrice);
      setError(`Price adjusted to ${snappedPrice} to match tick size of ${tickSize}`);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ side, price, quantity });
      // Reset form after successful submission
      setSide('BUY');
      setPrice(expiryDate.spotPrice + expiryDate.futurePremium);
      setQuantity(expiryDate.fxFuture?.minAmount || 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Place Order
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Side</InputLabel>
            <Select
              value={side}
              label="Side"
              onChange={(e: SelectChangeEvent) => setSide(e.target.value as 'BUY' | 'SELL')}
              disabled={disabled || submitting}
            >
              <MenuItem value="BUY">Buy</MenuItem>
              <MenuItem value="SELL">Sell</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Price"
            type="number"
            value={price}
            onChange={handlePriceChange}
            onBlur={handlePriceBlur}
            disabled={disabled || submitting}
            helperText={`Tick size: ${expiryDate.fxFuture?.tickSize || 0.0001}`}
            InputProps={{
              inputProps: { min: 0, step: 0.0001 }
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))}
            disabled={disabled || submitting}
            InputProps={{
              inputProps: { min: expiryDate.fxFuture?.minAmount || 1000, step: expiryDate.fxFuture?.minAmount || 1000 }
            }}
            helperText={`Minimum: ${expiryDate.fxFuture?.minAmount || 1000}`}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            color={side === 'BUY' ? 'success' : 'error'}
            onClick={handleSubmit}
            disabled={disabled || submitting}
          >
            {submitting ? <CircularProgress size={24} /> : `Place ${side} Order`}
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
};

interface FxFutureOrdersRealProps {
  expiryDate: FxExpiryDate;
}

export default function FxFutureOrdersReal({ expiryDate }: FxFutureOrdersRealProps) {
  const {
    orders,
    loading,
    error,
    fetchOrders,
    placeOrder,
    cancelOrder
  } = useFxFuturesTrading();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (expiryDate) {
      fetchOrders(expiryDate.id);
    }
  }, [expiryDate, fetchOrders]);

  const handlePlaceOrder = async (data: { side: 'BUY' | 'SELL'; price: number; quantity: number }) => {
    await placeOrder({
      expiryDateId: expiryDate.id,
      ...data
    });
    // Refresh orders after placing a new one
    fetchOrders(expiryDate.id);
  };

  const handleCancelClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (selectedOrderId) {
      await cancelOrder(selectedOrderId);
      setCancelDialogOpen(false);
      setSelectedOrderId(null);
      // Refresh orders after cancellation
      fetchOrders(expiryDate.id);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <OrderForm 
          expiryDate={expiryDate} 
          onSubmit={handlePlaceOrder} 
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Orders
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {loading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Side</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Filled</TableCell>
                      <TableCell align="right">Status</TableCell>
                      <TableCell align="right">Created At</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id.substring(0, 8)}...</TableCell>
                        <TableCell sx={{ 
                          color: order.side === 'BUY' ? 'success.main' : 'error.main',
                          fontWeight: 'bold'
                        }}>
                          {order.side}
                        </TableCell>
                        <TableCell align="right">{order.price.toFixed(4)}</TableCell>
                        <TableCell align="right">{order.quantity.toLocaleString()}</TableCell>
                        <TableCell align="right">{order.filledQuantity.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor: 
                                order.status === 'PENDING' ? 'info.light' : 
                                order.status === 'COMPLETED' ? 'success.light' : 
                                order.status === 'PARTIALLY_FILLED' ? 'warning.light' : 'error.light',
                              color: 'white',
                            }}
                          >
                            {order.status}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</TableCell>
                        <TableCell align="right">
                          {(order.status === 'PENDING' || order.status === 'PARTIALLY_FILLED') ? (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleCancelClick(order.id)}
                            >
                              Cancel
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                    {orders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          No orders found
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

      {/* Cancel Order Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Confirm Cancel Order</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to cancel this order?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No</Button>
          <Button onClick={handleCancelConfirm} color="error" variant="contained">
            Yes, Cancel Order
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
