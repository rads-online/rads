// In-memory store for OTPs
const otpStore = new Map();

// Store OTP with expiration (10 minutes)
const storeOTP = (email, otp) => {
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(email, { otp, expiresAt });
};

// Verify OTP
const verifyOTP = (email, otp) => {
    const storedData = otpStore.get(email);
    if (!storedData) return false;
    
    if (Date.now() > storedData.expiresAt) {
        otpStore.delete(email);
        return false;
    }
    
    return storedData.otp === otp;
};

// Remove OTP after successful verification
const removeOTP = (email) => {
    otpStore.delete(email);
};

module.exports = {
    storeOTP,
    verifyOTP,
    removeOTP
}; 