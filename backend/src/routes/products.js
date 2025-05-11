const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth, isAdmin, isSeller } = require('../middleware/auth');

const prisma = new PrismaClient();

// Create a new product (Seller only)
router.post('/', auth, isSeller, async (req, res) => {
  try {
    const { name, description, price, imageUrl, affiliateLink, brandId } = req.body;
    
    // Verify brand ownership
    const brand = await prisma.brand.findUnique({
      where: { id: brandId }
    });
    
    if (!brand || brand.ownerId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to add products to this brand' });
    }
    
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        affiliateLink,
        brandId,
        status: 'PENDING'
      }
    });
    
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Get all products (Public)
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'APPROVED'
      },
      include: {
        brand: true
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get products by brand (Public)
router.get('/brand/:brandId', async (req, res) => {
  try {
    const { brandId } = req.params;
    const products = await prisma.product.findMany({
      where: {
        brandId,
        status: 'APPROVED'
      },
      include: {
        brand: true
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get seller's products
router.get('/my-products', auth, isSeller, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        brand: {
          ownerId: req.user.userId
        }
      },
      include: {
        brand: true
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Get pending products (Admin only)
router.get('/pending', auth, isAdmin, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        brand: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending products' });
  }
});

// Update product status (Admin only)
router.patch('/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const product = await prisma.product.update({
      where: { id },
      data: { status }
    });
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product status' });
  }
});

// Update product (Seller only)
router.put('/:id', auth, isSeller, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, imageUrl, affiliateLink } = req.body;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: true
      }
    });
    
    if (!product || product.brand.ownerId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        imageUrl,
        affiliateLink,
        status: 'PENDING' // Reset status to pending for admin review
      }
    });
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Delete product (Seller or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: true
      }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (req.user.role !== 'ADMIN' && product.brand.ownerId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }
    
    await prisma.product.delete({
      where: { id }
    });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

module.exports = router; 