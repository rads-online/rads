import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Chip,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function SellerDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const location = useLocation();
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState({
    brands: [],
    products: []
  });
  const [openBrandDialog, setOpenBrandDialog] = useState(false);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [openWarningDialog, setOpenWarningDialog] = useState(false);
  const [warningAccepted, setWarningAccepted] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: '', description: '' });
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    affiliateLink: '',
    brandId: '',
    keywords: '',
  });
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'SELLER') {
      navigate('/login');
      return;
    }

    // Check if this is the first login
    const hasAcceptedWarning = localStorage.getItem('sellerWarningAccepted');
    if (!hasAcceptedWarning) {
      setOpenWarningDialog(true);
    }

    // Handle tab parameter from URL
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setTabValue(parseInt(tabParam));
    }

    fetchBrands();
    fetchProducts();
    fetchRequests();
  }, [user, navigate, location]);

  const handleWarningAccept = () => {
    if (warningAccepted) {
      localStorage.setItem('sellerWarningAccepted', 'true');
      setOpenWarningDialog(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/brands/my-brands');
      setBrands(response.data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products/my-products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const [brandsResponse, productsResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/brands/pending'),
        axios.get('http://localhost:5000/api/products/pending')
      ]);
      setRequests({
        brands: brandsResponse.data,
        products: productsResponse.data
      });
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Update URL with new tab value
    const params = new URLSearchParams(location.search);
    params.set('tab', newValue);
    navigate(`/seller/dashboard?${params.toString()}`);
  };

  const handleBrandSubmit = async () => {
    try {
      await axios.post('http://localhost:5000/api/brands', newBrand);
      setOpenBrandDialog(false);
      setNewBrand({ name: '', description: '' });
      fetchBrands();
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating brand');
    }
  };

  const handleProductSubmit = async () => {
    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        keywords: newProduct.keywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword !== '')
      };
      
      await axios.post('http://localhost:5000/api/products', productData);
      setOpenProductDialog(false);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        affiliateLink: '',
        brandId: '',
        keywords: '',
      });
      fetchProducts();
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating product');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        py: 4,
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Warning Dialog */}
      <Dialog
        open={openWarningDialog}
        onClose={() => {}} // Prevent closing by clicking outside
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxWidth: '600px',
            width: '100%',
          }
        }}
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
          Important Warning
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Strict Compliance Required
          </Alert>
          <Typography variant="body1" paragraph>
            Welcome to the Seller Dashboard. Before you proceed, please read and acknowledge the following important information:
          </Typography>
          <Typography variant="body1" paragraph>
            Any attempt to misuse this platform or provide incorrect information will be strictly penalized according to the level of forgery. This includes but is not limited to:
          </Typography>
          <ul>
            <li>Providing false product information</li>
            <li>Using misleading affiliate links</li>
            <li>Submitting fake brand details</li>
            <li>Manipulating product prices</li>
            <li>Using unauthorized images</li>
          </ul>
          <Typography variant="body1" paragraph>
            Penalties may include:
          </Typography>
          <ul>
            <li>Immediate account suspension</li>
            <li>Permanent ban from the platform</li>
            <li>Legal action in case of fraud</li>
            <li>Financial penalties</li>
          </ul>
          <FormControlLabel
            control={
              <Checkbox
                checked={warningAccepted}
                onChange={(e) => setWarningAccepted(e.target.checked)}
                color="error"
              />
            }
            label="I understand and agree to comply with all platform rules and regulations"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleWarningAccept}
            variant="contained"
            color="error"
            disabled={!warningAccepted}
          >
            I Accept
          </Button>
        </DialogActions>
      </Dialog>

      <Container 
        maxWidth="lg" 
        sx={{ 
          width: '100%',
          maxWidth: '1200px',
          mx: 'auto',
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Typography variant="h4" gutterBottom align="center">
            Seller Dashboard
          </Typography>

          <Card sx={{ width: '100%', mb: 4 }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Brands" />
              <Tab label="Products" />
              <Tab label="Requests" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={() => setOpenBrandDialog(true)}
                >
                  Add New Brand
                </Button>
              </Box>
              <TableContainer component={Paper} sx={{ maxHeight: '600px', overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {brands.map((brand) => (
                      <TableRow key={brand.id}>
                        <TableCell>{brand.name}</TableCell>
                        <TableCell>{brand.description}</TableCell>
                        <TableCell>
                          <Chip 
                            label={brand.status} 
                            color={
                              brand.status === 'APPROVED' ? 'success' :
                              brand.status === 'REJECTED' ? 'error' :
                              'warning'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(brand.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={() => setOpenProductDialog(true)}
                >
                  Add New Product
                </Button>
              </Box>
              <TableContainer component={Paper} sx={{ maxHeight: '600px', overflow: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Brand</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Affiliate Link</TableCell>
                      <TableCell>Created At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.brand.name}</TableCell>
                        <TableCell>₹{product.price}</TableCell>
                        <TableCell>
                          <Chip 
                            label={product.status} 
                            color={
                              product.status === 'APPROVED' ? 'success' :
                              product.status === 'REJECTED' ? 'error' :
                              'warning'
                            }
                          />
                        </TableCell>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Pending Brand Requests
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: '300px', overflow: 'auto', mb: 4 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requests.brands.map((brand) => (
                        <TableRow key={brand.id}>
                          <TableCell>{brand.name}</TableCell>
                          <TableCell>{brand.description}</TableCell>
                          <TableCell>
                            <Chip 
                              label={brand.status} 
                              color="warning"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(brand.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {requests.brands.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            No pending brand requests
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography variant="h6" gutterBottom>
                  Pending Product Requests
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: '300px', overflow: 'auto' }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Brand</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requests.products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.brand.name}</TableCell>
                          <TableCell>₹{product.price}</TableCell>
                          <TableCell>
                            <Chip 
                              label={product.status} 
                              color="warning"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(product.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {requests.products.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No pending product requests
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </TabPanel>
          </Card>
        </Box>
      </Container>

      {/* Add Brand Dialog */}
      <Dialog 
        open={openBrandDialog} 
        onClose={() => setOpenBrandDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            maxWidth: '600px',
            width: '100%',
          }
        }}
      >
        <DialogTitle>Add New Brand</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Brand Name"
            fullWidth
            value={newBrand.name}
            onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newBrand.description}
            onChange={(e) => setNewBrand({ ...newBrand, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBrandDialog(false)}>Cancel</Button>
          <Button onClick={handleBrandSubmit} variant="contained">
            Add Brand
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog 
        open={openProductDialog} 
        onClose={() => setOpenProductDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            maxWidth: '600px',
            width: '100%',
          }
        }}
      >
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Product Name"
            fullWidth
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Price"
            type="number"
            fullWidth
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Image URL"
            fullWidth
            value={newProduct.imageUrl}
            onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Affiliate Link"
            fullWidth
            value={newProduct.affiliateLink}
            onChange={(e) => setNewProduct({ ...newProduct, affiliateLink: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Keywords"
            fullWidth
            required
            helperText="Enter keywords separated by commas. These will be used for categorization and search filters."
            value={newProduct.keywords}
            onChange={(e) => setNewProduct({ ...newProduct, keywords: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="brand-select-label">Brand</InputLabel>
            <Select
              labelId="brand-select-label"
              value={newProduct.brandId}
              label="Brand"
              onChange={(e) => setNewProduct({ ...newProduct, brandId: e.target.value })}
            >
              {brands.map((brand) => (
                <MenuItem key={brand.id} value={brand.id}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProductDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleProductSubmit} 
            variant="contained"
            disabled={!newProduct.keywords.trim()}
          >
            Add Product
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SellerDashboard; 