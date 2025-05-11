const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { generateOTP, sendOTPEmail } = require('../utils/emailService');
const { storeOTP, verifyOTP, removeOTP } = require('../models/otpStore');

const prisma = new PrismaClient();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'CUSTOMER'
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Request password reset (send OTP)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate and send OTP
        const otp = generateOTP();
        const emailSent = await sendOTPEmail(email, otp);

        if (!emailSent) {
            return res.status(500).json({ message: 'Error sending OTP email' });
        }

        // Store OTP
        storeOTP(email, otp);

        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error processing forgot password request' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const isValid = verifyOTP(email, otp);
        if (!isValid) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Generate a temporary token for password reset
        const resetToken = jwt.sign(
            { email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ 
            message: 'OTP verified successfully',
            resetToken
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'Error verifying OTP' });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        // Verify reset token
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        const { email } = decoded;

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        // Remove OTP from store
        removeOTP(email);

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

module.exports = router; 