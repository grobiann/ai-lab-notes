import { Router } from 'express';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const authService = new AuthService();
const userService = new UserService();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Missing required fields: username, email, password' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long' });
      return;
    }

    const result = await authService.register(username, email, password);
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    res.status(400).json({ error: message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Missing username or password' });
      return;
    }

    const result = await authService.login(username, password);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    res.status(401).json({ error: message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Missing refresh token' });
      return;
    }

    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const result = await authService.refreshAccessToken(
      refreshToken,
      userAgent,
      ipAddress
    );

    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token refresh failed';
    res.status(401).json({ error: message });
  }
});

router.post('/logout', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Missing refresh token' });
      return;
    }

    await authService.logout(refreshToken);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.post('/logout-all', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await authService.logoutAllDevices(req.user.userId);
    res.status(200).json({ message: 'Logged out from all devices' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await userService.getUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { passwordHash, passwordResetToken, verificationToken, refreshTokenBlacklist, ...userWithoutSensitive } = user;
    res.status(200).json(userWithoutSensitive);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.post('/change-password', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res.status(400).json({ error: 'Missing old password or new password' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await authService.changePassword(req.user.userId, oldPassword, newPassword);
    res.status(200).json({ message: 'Password changed successfully. Please login again.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Password change failed';
    res.status(400).json({ error: message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }

    const resetToken = await authService.requestPasswordReset(email);
    res.status(200).json({
      message: 'Password reset link sent to email',
      resetToken,
    });
  } catch (error) {
    res.status(400).json({ error: 'User with this email does not exist' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: 'Missing reset token or new password' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters long' });
      return;
    }

    await authService.resetPassword(token, newPassword);
    res.status(200).json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Password reset failed';
    res.status(400).json({ error: message });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Missing verification token' });
      return;
    }

    await authService.verifyEmail(token);
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email verification failed';
    res.status(400).json({ error: message });
  }
});

router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }

    const verificationToken = await authService.resendVerificationEmail(email);
    res.status(200).json({
      message: 'Verification email sent',
      verificationToken,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to resend verification email';
    res.status(400).json({ error: message });
  }
});

export default router;
