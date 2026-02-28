import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateVerificationToken,
  generatePasswordResetToken,
  getTokenExpiration,
  isTokenExpired,
} from '../utils/token';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async createUser(
    username: string,
    email: string,
    password: string,
    role: 'user' | 'admin' = 'user'
  ): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = generateVerificationToken();

    const user = this.userRepository.create({
      username,
      email,
      passwordHash,
      role,
      verificationToken,
      verificationTokenExpiresAt: getTokenExpiration(24),
      emailVerified: role === 'admin',
    });

    return this.userRepository.save(user);
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOneBy({ username });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async validatePassword(
    user: User,
    password: string
  ): Promise<boolean> {
    return comparePassword(password, user.passwordHash);
  }

  async updateUser(
    id: number,
    data: Partial<User>
  ): Promise<User | null> {
    await this.userRepository.update(id, data);
    return this.getUserById(id);
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await this.validatePassword(user, oldPassword);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const passwordHash = await hashPassword(newPassword);
    return this.updateUser(userId, {
      passwordHash,
      lastPasswordChangeAt: new Date(),
    }) as Promise<User>;
  }

  async requestPasswordReset(email: string): Promise<string> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error('User with this email does not exist');
    }

    const resetToken = generatePasswordResetToken();
    const resetTokenExpiresAt = getTokenExpiration(1);

    await this.updateUser(user.id, {
      passwordResetToken: resetToken,
      passwordResetTokenExpiresAt: resetTokenExpiresAt,
    });

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (!user) {
      throw new Error('Invalid reset token');
    }

    if (!user.passwordResetTokenExpiresAt || isTokenExpired(user.passwordResetTokenExpiresAt)) {
      throw new Error('Reset token has expired');
    }

    const passwordHash = await hashPassword(newPassword);

    return this.updateUser(user.id, {
      passwordHash,
      passwordResetToken: null,
      passwordResetTokenExpiresAt: null,
      lastPasswordChangeAt: new Date(),
    }) as Promise<User>;
  }

  async verifyEmail(token: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new Error('Invalid verification token');
    }

    if (!user.verificationTokenExpiresAt || isTokenExpired(user.verificationTokenExpiresAt)) {
      throw new Error('Verification token has expired');
    }

    return this.updateUser(user.id, {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    }) as Promise<User>;
  }

  async resendVerificationEmail(email: string): Promise<string> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error('User with this email does not exist');
    }

    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }

    const verificationToken = generateVerificationToken();
    const verificationTokenExpiresAt = getTokenExpiration(24);

    await this.updateUser(user.id, {
      verificationToken,
      verificationTokenExpiresAt,
    });

    return verificationToken;
  }
}
