import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useAuth } from '../contexts/AuthContext';

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    brands: 0,
    products: 0,
    pendingRequests: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch user stats if seller
    if (user.role === 'SELLER') {
      fetchSellerStats();
    }
  }, [user, navigate]);

  const fetchSellerStats = async () => {
    try {
      const [brandsResponse, productsResponse, requestsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/brands/my-brands'),
        fetch('http://localhost:5000/api/products/my-products'),
        fetch('http://localhost:5000/api/brands/pending')
      ]);

      const brands = await brandsResponse.json();
      const products = await productsResponse.json();
      const requests = await requestsResponse.json();

      setStats({
        brands: brands.length,
        products: products.length,
        pendingRequests: requests.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'SELLER':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Grid container spacing={4}>
            {/* Profile Header */}
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 150,
                  height: 150,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user?.name}
              </Typography>
              <Chip
                label={user?.role}
                color={getRoleColor(user?.role)}
                sx={{ mb: 2 }}
              />
            </Grid>

            {/* Profile Details */}
            <Grid item xs={12} md={8}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={user?.email}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Name"
                    secondary={user?.name}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <BadgeIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Role"
                    secondary={user?.role}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <CalendarTodayIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Member Since"
                    secondary={new Date(user?.createdAt).toLocaleDateString()}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Paper>

        {/* Seller Stats */}
        {user?.role === 'SELLER' && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Brands
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {stats.brands}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Products
                  </Typography>
                  <Typography variant="h3" color="primary">
                    {stats.products}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Pending Requests
                  </Typography>
                  <Typography variant="h3" color="warning.main">
                    {stats.pendingRequests}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Quick Actions */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          {user?.role === 'SELLER' && (
            <Button
              variant="contained"
              onClick={() => navigate('/seller/dashboard')}
              sx={{ mr: 2 }}
            >
              Go to Dashboard
            </Button>
          )}
          {user?.role === 'ADMIN' && (
            <Button
              variant="contained"
              onClick={() => navigate('/admin/dashboard')}
              sx={{ mr: 2 }}
            >
              Go to Admin Dashboard
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => navigate('/products')}
          >
            Browse Products
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Profile; 