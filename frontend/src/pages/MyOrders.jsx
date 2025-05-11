import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  CardMedia,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function MyInterests() {
  const [interests, setInterests] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchInterests();
  }, [user, navigate]);

  const fetchInterests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/interests/my-interests');
      setInterests(response.data);
    } catch (error) {
      console.error('Error fetching interests:', error);
      setError('Error fetching interests');
    }
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
  };

  const handleRemoveInterest = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/interests/${productId}`);
      fetchInterests();
    } catch (error) {
      console.error('Error removing interest:', error);
      setError('Error removing interest');
    }
  };

  const handleBuyNow = (affiliateLink) => {
    window.open(affiliateLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="lg" sx={{ width: '100%' }}>
        <Box
          sx={{
            maxWidth: '1200px',
            mx: 'auto',
            width: '100%',
          }}
        >
          <Typography variant="h4" gutterBottom align="center">
            My Interests
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {interests.map((interest) => (
              <Grid item key={interest.id} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveInterest(interest.product.id)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <CardMedia
                    component="img"
                    height="200"
                    image={interest.product.imageUrl}
                    alt={interest.product.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {interest.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {interest.product.description.substring(0, 100)}...
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Chip
                        label={interest.product.brand.name}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    </Box>
                    <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                      ₹{interest.product.price}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleBuyNow(interest.product.affiliateLink)}
                      >
                        Buy Now
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => handleViewDetails(interest.product)}
                      >
                        Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {interests.length === 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography align="center" color="text.secondary">
                      You haven't shown interest in any products yet.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      </Container>

      {/* Product Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxWidth: '800px',
            width: '100%',
          },
        }}
      >
        {selectedProduct && (
          <>
            <DialogTitle>
              Product Details
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <CardMedia
                      component="img"
                      height="300"
                      image={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      sx={{ objectFit: 'contain' }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>
                      {selectedProduct.name}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {selectedProduct.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={selectedProduct.brand.name}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    </Box>
                    <Typography variant="h4" color="primary" gutterBottom>
                      ₹{selectedProduct.price}
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={() => handleBuyNow(selectedProduct.affiliateLink)}
                      sx={{ mt: 2 }}
                    >
                      Buy Now
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default MyInterests; 