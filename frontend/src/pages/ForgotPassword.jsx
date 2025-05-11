import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../config';
import {
    Container,
    Typography,
    TextField,
    Button,
    Alert,
    Box
} from '@mui/material';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showOTPForm, setShowOTPForm] = useState(false);
    const [otp, setOtp] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${BACKEND_URL}/api/auth/forgot-password`, { email });
            setMessage(response.data.message);
            setError('');
            setShowOTPForm(true);
        } catch (error) {
            setError(error.response?.data?.message || 'Error sending OTP');
            setMessage('');
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${BACKEND_URL}/api/auth/verify-otp`, { email, otp });
            setMessage(response.data.message);
            setError('');
            setResetToken(response.data.resetToken);
        } catch (error) {
            setError(error.response?.data?.message || 'Error verifying OTP');
            setMessage('');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            const response = await axios.post(`${BACKEND_URL}/api/auth/reset-password`, {
                resetToken,
                newPassword
            });
            setMessage(response.data.message);
            setError('');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setError(error.response?.data?.message || 'Error resetting password');
            setMessage('');
        }
    };

    return (
        <Container maxWidth="xs">
            <Box display="flex" flexDirection="column" alignItems="center" mt={8}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Forgot Password
                </Typography>

                {!showOTPForm ? (
                    <Box component="form" onSubmit={handleForgotPassword} mt={2} width="100%">
                        <TextField
                            fullWidth
                            required
                            label="Email Address"
                            type="email"
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            type="submit"
                            sx={{ mt: 2 }}
                        >
                            Send OTP
                        </Button>
                    </Box>
                ) : !resetToken ? (
                    <Box component="form" onSubmit={handleVerifyOTP} mt={2} width="100%">
                        <TextField
                            fullWidth
                            required
                            label="Enter OTP"
                            type="text"
                            margin="normal"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            type="submit"
                            sx={{ mt: 2 }}
                        >
                            Verify OTP
                        </Button>
                    </Box>
                ) : (
                    <Box component="form" onSubmit={handleResetPassword} mt={2} width="100%">
                        <TextField
                            fullWidth
                            required
                            label="New Password"
                            type="password"
                            margin="normal"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            required
                            label="Confirm Password"
                            type="password"
                            margin="normal"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            type="submit"
                            sx={{ mt: 2 }}
                        >
                            Reset Password
                        </Button>
                    </Box>
                )}

                {message && (
                    <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
                        {message}
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                        {error}
                    </Alert>
                )}
            </Box>
        </Container>
    );
};

export default ForgotPassword;
