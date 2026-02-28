import { AppDataSource } from '../config/database';
import { RefreshToken } from '../models/RefreshToken';
import { User } from '../models/User';
import { generateRandomToken } from '../utils/token';

export class RefreshTokenService {
  private refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

  async createRefreshToken(
    user: User,
    expiresAt: Date,
    userAgent?: string,
    ipAddress?: string
  ): Promise<RefreshToken> {
    const token = generateRandomToken();

    const refreshToken = this.refreshTokenRepository.create({
      token,
      user,
      userId: user.id,
      expiresAt,
      userAgent,
      ipAddress,
      revoked: false,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  async getRefreshToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: { token, revoked: false },
      relations: ['user'],
    });
  }

  async isValidRefreshToken(token: string): Promise<boolean> {
    const refreshToken = await this.getRefreshToken(token);
    if (!refreshToken) return false;

    const now = new Date();
    return refreshToken.expiresAt > now;
  }

  async revokeRefreshToken(token: string): Promise<boolean> {
    const result = await this.refreshTokenRepository.update(
      { token },
      { revoked: true }
    );
    return result.affected ? result.affected > 0 : false;
  }

  async revokeAllUserTokens(userId: number): Promise<number> {
    const result = await this.refreshTokenRepository.update(
      { userId, revoked: false },
      { revoked: true }
    );
    return result.affected || 0;
  }

  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.refreshTokenRepository.delete({
      expiresAt: () => '"expiresAt" < NOW()',
    } as any);
    return result.affected || 0;
  }
}
