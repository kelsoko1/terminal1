import React, { useState } from 'react';
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
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCommodityFutures } from '../../../lib/hooks/useCommodityFutures';
import { CommodityFuture } from '../../../lib/services/futuresService';

interface FutureDialogProps {
  open: boolean;
  onClose: () => void;
  future?: CommodityFuture;
  onSave: (data: any) => Promise<void>;
  title: string;
}

const FutureDialog: React.FC<FutureDialogProps> = ({ open, onClose, future, onSave, title }) => {
  const [formData, setFormData] = useState<Partial<CommodityFuture>>(
    future || {
      name: '',
      symbol: '',
      baseAsset: '',
      contractSize: 1,
      unit: 'kg',
      expiryMonth: '',
      expiryYear: new Date().getFullYear(),
      price: 0,
      initialMargin: 5,
      maintenanceMargin: 2.5,
      status: 'active'
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: ['contractSize', 'price', 'expiryYear', 'initialMargin', 'maintenanceMargin'].includes(name)
          ? Number(value)
          : value
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save future');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Symbol"
              name="symbol"
              value={formData.symbol || ''}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Base Asset"
              name="baseAsset"
              value={formData.baseAsset || ''}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contract Size"
              name="contractSize"
              type="number"
              value={formData.contractSize || ''}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Unit"
              name="unit"
              value={formData.unit || ''}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Expiry Month"
              name="expiryMonth"
              value={formData.expiryMonth || ''}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Expiry Year"
              name="expiryYear"
              type="number"
              value={formData.expiryYear || ''}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Price"
              name="price"
              type="number"
              value={formData.price || ''}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Initial Margin (%)"
              name="initialMargin"
              type="number"
              value={formData.initialMargin || ''}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Maintenance Margin (%)"
              name="maintenanceMargin"
              type="number"
              value={formData.maintenanceMargin || ''}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status || 'active'}
                label="Status"
                onChange={handleChange}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary" 
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function CommodityFuturesReal() {
  const {
    futures,
    loading,
    error,
    page,
    limit,
    status,
    totalPages,
    totalItems,
    setPage,
    setLimit,
    setStatus,
    fetchFutures,
    createFuture,
    updateFuture,
    deleteFuture
  } = useCommodityFutures();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editFuture, setEditFuture] = useState<CommodityFuture | undefined>(undefined);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedFutureId, setSelectedFutureId] = useState<string | null>(null);

  const handleAddClick = () => {
    setEditFuture(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (future: CommodityFuture) => {
    setEditFuture(future);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedFutureId(id);
    setDeleteConfirmOpen(true);
  };

  const handleSaveFuture = async (data: any) => {
    if (editFuture) {
      await updateFuture(editFuture.id, data);
    } else {
      await createFuture(data);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedFutureId) {
      await deleteFuture(selectedFutureId);
      setDeleteConfirmOpen(false);
      setSelectedFutureId(null);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage + 1); // API uses 1-based indexing
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleStatusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatus(event.target.value as string);
    setPage(1);
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Commodity Futures
          </Typography>
          <Box>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                onChange={handleStatusChange}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
            >
              Add Future
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading && futures.length === 0 ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Base Asset</TableCell>
                    <TableCell>Contract Size</TableCell>
                    <TableCell>Expiry</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Change</TableCell>
                    <TableCell align="right">Open Interest</TableCell>
                    <TableCell align="right">Volume</TableCell>
                    <TableCell align="right">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {futures.map((future) => (
                    <TableRow key={future.id}>
                      <TableCell>{future.name}</TableCell>
                      <TableCell>{future.symbol}</TableCell>
                      <TableCell>{future.baseAsset}</TableCell>
                      <TableCell>{future.contractSize} {future.unit}</TableCell>
                      <TableCell>{future.expiryMonth} {future.expiryYear}</TableCell>
                      <TableCell align="right">{future.price.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ color: future.change >= 0 ? 'success.main' : 'error.main' }}>
                        {future.change >= 0 ? '+' : ''}{future.change.toFixed(2)}%
                      </TableCell>
                      <TableCell align="right">{future.openInterest}</TableCell>
                      <TableCell align="right">{future.volume}</TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: 
                              future.status === 'active' ? 'success.light' : 
                              future.status === 'inactive' ? 'warning.light' : 'error.light',
                            color: 'white',
                          }}
                        >
                          {future.status}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditClick(future)}
                          sx={{ mr: 1 }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteClick(future.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {futures.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        No futures found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 20, 50]}
              component="div"
              count={totalItems}
              rowsPerPage={limit}
              page={page - 1} // API uses 1-based indexing
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}

        <FutureDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          future={editFuture}
          onSave={handleSaveFuture}
          title={editFuture ? 'Edit Commodity Future' : 'Add Commodity Future'}
        />

        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this commodity future?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
