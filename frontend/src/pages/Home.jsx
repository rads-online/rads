import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { BACKEND_URL } from '../config';


function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openWarningDialog, setOpenWarningDialog] = useState(false);
  const [warningAccepted, setWarningAccepted] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/products`);
        setFeaturedProducts(response.data.slice(0, 8)); // Show first 8 products
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchFeaturedProducts();

    // Check if this is the first login for a customer
    if (user && user.role === 'CUSTOMER') {
      const hasAcceptedWarning = localStorage.getItem('customerWarningAccepted');
      if (!hasAcceptedWarning) {
        setOpenWarningDialog(true);
      }
    }
  }, [user]);

  const handleWarningAccept = () => {
    if (warningAccepted) {
      localStorage.setItem('customerWarningAccepted', 'true');
      setOpenWarningDialog(false);
    }
  };

  return (
    <Box>
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
        <DialogTitle sx={{ color: 'info.main', fontWeight: 'bold' }}>
          Important Notice
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Product Responsibility Disclaimer
          </Alert>
          <Typography variant="body1" paragraph>
            Welcome to RADS Online. Before you proceed, please read and acknowledge the following important information:
          </Typography>
          <Typography variant="body1" paragraph>
            Important Notice About Products:
          </Typography>
          <ul>
            <li>All products listed on this platform are from third-party sellers</li>
            <li>RADS Online is not responsible for the quality, authenticity, or delivery of products</li>
            <li>Product warranties and guarantees are the responsibility of the respective product owners</li>
            <li>All transactions are between you and the product owner</li>
            <li>RADS Online acts only as a platform for product discovery</li>
          </ul>
          <Typography variant="body1" paragraph>
            By proceeding, you acknowledge that:
          </Typography>
          <ul>
            <li>You understand RADS Online's role as a platform only</li>
            <li>You will verify product details before making any purchase</li>
            <li>You will contact the product owner for any product-related issues</li>
            <li>You understand that RADS Online is not liable for any product-related disputes</li>
          </ul>
          <FormControlLabel
            control={
              <Checkbox
                checked={warningAccepted}
                onChange={(e) => setWarningAccepted(e.target.checked)}
                color="primary"
              />
            }
            label="I understand and agree to the terms regarding product responsibility"
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleWarningAccept}
            variant="contained"
            color="primary"
            disabled={!warningAccepted}
          >
            I Understand
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(https://source.unsplash.com/random?shopping)',
          height: '400px',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.5)',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            p: { xs: 3, md: 6 },
            pr: { md: 0 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography
            component="h1"
            variant="h3"
            color="inherit"
            gutterBottom
          >
            Welcome to RADS Online
          </Typography>
          <Typography variant="h5" color="inherit" paragraph>
            Discover amazing products from trusted sellers
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/products"
            sx={{ mt: 2, maxWidth: '200px' }}
          >
            Shop Now
          </Button>
        </Box>
      </Paper>

      {/* Search Section */}
      <Container maxWidth="md" sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Container>

      {/* Featured Products */}
      <Container>
        <Typography variant="h4" component="h2" gutterBottom>
          Featured Products
        </Typography>
        <Grid container spacing={4}>
          {featuredProducts.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.2s ease-in-out',
                    boxShadow: 3,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={product.imageUrl}
                  alt={product.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {product.description.substring(0, 100)}...
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Brand: {product.brand.name}
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    ₹{product.price}
                  </Typography>
                  <Button
                    variant="contained"
                    component="a"
                    href={product.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: 'primary.main',
            color: 'white',
          }}
        >
          <Typography variant="h4" gutterBottom>
            Are you a seller?
          </Typography>
          <Typography variant="body1" paragraph>
            Join our platform and showcase your products to thousands of customers
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/register"
            sx={{ backgroundColor: 'white', color: 'primary.main' }}
          >
            Register as Seller
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default Home; 