import { UserService } from './UserService';
import { RefreshTokenService } from './RefreshTokenService';
import { generateToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { getTokenExpiration } from '../utils/token';
import { config } from '../config/env';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private userService: UserService;
  private refreshTokenService: RefreshTokenService;

  constructor() {
    this.userService = new UserService();
    this.refreshTokenService = new RefreshTokenService();
  }

  async register(
    username: string,
    email: string,
    password: string
  ): Promise<LoginResponse> {
    const user = await this.userService.createUser(username, email, password);
    return this.generateAuthResponse(user);
  }

  async login(
    username: string,
    password: string
  ): Promise<LoginResponse> {
    const user = await this.userService.getUserByUsername(username);

    if (!user) {
      throw new Error('Invalid username or password');
    }

    const isPasswordValid = await this.userService.validatePassword(
      user,
      password
    );

    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }

    return this.generateAuthResponse(user);
  }

  async refreshAccessToken(
    refreshTokenValue: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<RefreshTokenResponse> {
    const isValid = await this.refreshTokenService.isValidRefreshToken(
      refreshTokenValue
    );

    if (!isValid) {
      throw new Error('Invalid or expired refresh token');
    }

    const refreshTokenRecord = await this.refreshTokenService.getRefreshToken(
      refreshTokenValue
    );

    if (!refreshTokenRecord || !refreshTokenRecord.user) {
      throw new Error('Invalid refresh token');
    }

    const user = refreshTokenRecord.user;

    const accessToken = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    await this.refreshTokenService.createRefreshToken(
      user,
      getTokenExpiration(parseInt(config.jwt.refreshExpiresIn as string) * 24 || 168),
      userAgent,
      ipAddress
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshTokenValue: string): Promise<void> {
    await this.refreshTokenService.revokeRefreshToken(refreshTokenValue);
  }

  async logoutAllDevices(userId: number): Promise<void> {
    await this.refreshTokenService.revokeAllUserTokens(userId);
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    await this.userService.changePassword(userId, oldPassword, newPassword);
    await this.logoutAllDevices(userId);
  }

  async requestPasswordReset(email: string): Promise<string> {
    return this.userService.requestPasswordReset(email);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.userService.resetPassword(token, newPassword);
  }

  async verifyEmail(token: string): Promise<void> {
    await this.userService.verifyEmail(token);
  }

  async resendVerificationEmail(email: string): Promise<string> {
    return this.userService.resendVerificationEmail(email);
  }

  private async generateAuthResponse(user: any): Promise<LoginResponse> {
    const accessToken = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    const refreshTokenRecord = await this.refreshTokenService.createRefreshToken(
      user,
      getTokenExpiration(parseInt(config.jwt.refreshExpiresIn as string) * 24 || 168)
    );

    return {
      accessToken,
      refreshToken: refreshTokenRecord.token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }
}
