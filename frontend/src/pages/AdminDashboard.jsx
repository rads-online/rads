import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { BACKEND_URL } from '../config';



function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    affiliateLink: '',
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
      return;
    }

    fetchBrands();
    fetchProducts();
  }, [user, navigate]);

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/brands/admin`);
      setBrands(response.data);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setError('Error fetching brands');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/products/pending`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Error fetching products');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBrandStatusUpdate = async (brandId, newStatus) => {
    try {
      await axios.patch(`${BACKEND_URL}/api/brands/${brandId}/status`, {
        status: newStatus,
      });
      fetchBrands();
    } catch (error) {
      console.error('Error updating brand status:', error);
      setError('Error updating brand status');
    }
  };

  const handleProductStatusUpdate = async (productId, newStatus) => {
    try {
      await axios.patch(`${BACKEND_URL}/api/products/${productId}/status`, {
        status: newStatus,
      });
      fetchProducts();
    } catch (error) {
      console.error('Error updating product status:', error);
      setError('Error updating product status');
    }
  };

  const handleEditClick = (item, type) => {
    setSelectedItem({ ...item, type });
    setEditForm({
      name: item.name,
      description: item.description || '',
      price: item.price || '',
      imageUrl: item.imageUrl || '',
      affiliateLink: item.affiliateLink || '',
    });
    setOpenEditDialog(true);
  };

  const handleDeleteClick = (item, type) => {
    setSelectedItem({ ...item, type });
    setOpenDeleteDialog(true);
  };

  const handleEditSubmit = async () => {
    try {
      if (selectedItem.type === 'product') {
        await axios.put(`${BACKEND_URL}/api/products/${selectedItem.id}`, editForm);
        fetchProducts();
      } else {
        await axios.put(`${BACKEND_URL}/api/brands/${selectedItem.id}`, {
          name: editForm.name,
          description: editForm.description,
        });
        fetchBrands();
      }
      setOpenEditDialog(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      setError('Error updating item');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      if (selectedItem.type === 'product') {
        await axios.delete(`${BACKEND_URL}/api/products/${selectedItem.id}`);
        fetchProducts();
      } else {
        await axios.delete(`${BACKEND_URL}/api/brands/${selectedItem.id}`);
        fetchBrands();
      }
      setOpenDeleteDialog(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Error deleting item');
    }
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Card>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Pending Brands" />
            <Tab label="Pending Products" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {brands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell>{brand.name}</TableCell>
                      <TableCell>{brand.description}</TableCell>
                      <TableCell>{brand.owner.name}</TableCell>
                      <TableCell>{brand.status}</TableCell>
                      <TableCell>
                        {new Date(brand.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {brand.status === 'PENDING' && (
                            <>
                              <Button
                                size="small"
                                color="success"
                                onClick={() => handleBrandStatusUpdate(brand.id, 'APPROVED')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleBrandStatusUpdate(brand.id, 'REJECTED')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditClick(brand, 'brand')}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(brand, 'brand')}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Seller</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Affiliate Link</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.brand.name}</TableCell>
                      <TableCell>₹{product.price}</TableCell>
                      <TableCell>{product.brand.owner.name}</TableCell>
                      <TableCell>{product.status}</TableCell>
                      <TableCell>
                        {product.affiliateLink ? (
                          <Button
                            href={product.affiliateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: 'none' }}
                          >
                            View Link
                          </Button>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No link
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(product.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {product.status === 'PENDING' && (
                            <>
                              <Button
                                size="small"
                                color="success"
                                onClick={() => handleProductStatusUpdate(product.id, 'APPROVED')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleProductStatusUpdate(product.id, 'REJECTED')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditClick(product, 'product')}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(product, 'product')}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Card>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit {selectedItem?.type === 'product' ? 'Product' : 'Brand'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            {selectedItem?.type === 'product' && (
              <>
                <TextField
                  label="Price"
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Image URL"
                  value={editForm.imageUrl}
                  onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Affiliate Link"
                  value={editForm.affiliateLink}
                  onChange={(e) => setEditForm({ ...editForm, affiliateLink: e.target.value })}
                  fullWidth
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {selectedItem?.type}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminDashboard; 
