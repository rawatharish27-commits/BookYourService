import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.post('/send-otp', asyncHandler(authController.sendOTP));
router.post('/verify-otp', asyncHandler(authController.verifyOTP));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));

router.get('/me', asyncHandler(authController.getMe));
router.put('/me', asyncHandler(authController.updateMe));
router.post('/change-password', asyncHandler(authController.changePassword));
router.delete('/me', asyncHandler(authController.deleteMe));

export default router;
