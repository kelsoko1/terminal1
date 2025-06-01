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
  TablePagination,
  TableRow,
  Typography,
  Alert
} from '@mui/material';
import { useFxFuturesTrading } from '../../lib/hooks/useFuturesTrading';
import { FxExpiryDate } from '../../lib/services/futuresService';

interface FxFutureTradesRealProps {
  expiryDate: FxExpiryDate;
}

export default function FxFutureTradesReal({ expiryDate }: FxFutureTradesRealProps) {
  const {
    trades,
    loading,
    error,
    fetchTrades,
    totalTrades
  } = useFxFuturesTrading();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (expiryDate) {
      fetchTrades(expiryDate.id, undefined, page + 1, rowsPerPage);
    }
  }, [expiryDate, fetchTrades, page, rowsPerPage]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Trades - {expiryDate.fxFuture?.name || 'FX Future'} ({expiryDate.displayName})
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Trade ID</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell>Buy Order ID</TableCell>
                    <TableCell>Sell Order ID</TableCell>
                    <TableCell align="right">Trade Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell>{trade.id.substring(0, 8)}...</TableCell>
                      <TableCell align="right">{trade.price.toFixed(4)}</TableCell>
                      <TableCell align="right">{trade.quantity.toLocaleString()}</TableCell>
                      <TableCell>{trade.buyerOrderId.substring(0, 8)}...</TableCell>
                      <TableCell>{trade.sellerOrderId.substring(0, 8)}...</TableCell>
                      <TableCell align="right">{trade.createdAt ? new Date(trade.createdAt).toLocaleString() : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                  {trades.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No trades found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalTrades}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
