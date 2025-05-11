const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth, isAdmin, isSeller } = require('../middleware/auth');

const prisma = new PrismaClient();

// Create a new brand (Seller only)
router.post('/', auth, isSeller, async (req, res) => {
  try {
    const { name, description } = req.body;
    const brand = await prisma.brand.create({
      data: {
        name,
        description,
        ownerId: req.user.userId,
        status: 'PENDING'
      }
    });
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Error creating brand' });
  }
});

// Get all brands (Admin only)
router.get('/admin', auth, isAdmin, async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching brands' });
  }
});

// Get seller's brands
router.get('/my-brands', auth, isSeller, async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: {
        ownerId: req.user.userId
      }
    });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching brands' });
  }
});

// Update brand status (Admin only)
router.patch('/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const brand = await prisma.brand.update({
      where: { id },
      data: { status }
    });
    
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Error updating brand status' });
  }
});

// Update brand (Seller only)
router.put('/:id', auth, isSeller, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    const brand = await prisma.brand.findUnique({
      where: { id }
    });
    
    if (!brand || brand.ownerId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this brand' });
    }
    
    const updatedBrand = await prisma.brand.update({
      where: { id },
      data: {
        name,
        description,
        status: 'PENDING' // Reset status to pending for admin review
      }
    });
    
    res.json(updatedBrand);
  } catch (error) {
    res.status(500).json({ message: 'Error updating brand' });
  }
});

// Delete brand (Seller or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await prisma.brand.findUnique({
      where: { id }
    });
    
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    
    if (req.user.role !== 'ADMIN' && brand.ownerId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this brand' });
    }
    
    await prisma.brand.delete({
      where: { id }
    });
    
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting brand' });
  }
});

module.exports = router; 