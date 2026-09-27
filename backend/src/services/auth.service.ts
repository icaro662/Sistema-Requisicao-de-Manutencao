import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { randomBytes, randomUUID } from 'crypto';
import { LoginDto } from '../dtos/auth/login.dto';
import { RegisterDto } from '../dtos/auth/register.dto';
import { RefreshTokenDto } from '../dtos/auth/refresh-token.dto';
import { ForgotPasswordDto } from '../dtos/auth/forgot-password.dto';
import { ResetPasswordDto } from '../dtos/auth/reset-password.dto';
import { User } from '../models/user.entity';
import { EmailProvider } from '../core/providers/email.provider';
import { passwordResetEmailTemplate } from '../core/templates/email.template';
import { UsersService } from './users.service';

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}

interface RefreshPayload {
  sub: string;
  email: string;
  role: string;
  type: 'refresh';
  tokenId: string;
  tokenVersion: number;
}

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly refreshTokenTtl: import('jsonwebtoken').SignOptions['expiresIn'];

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailProvider: EmailProvider,
    private readonly config: ConfigService,
  ) {
    this.jwtSecret = config.get<string>('JWT_SECRET', 'change-me');
    this.refreshTokenTtl = config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d') as import('jsonwebtoken').SignOptions['expiresIn'];
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !user.isActive || !(await compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user, 'Login successful');
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) throw new ConflictException('Email is already registered');

    const user = await this.usersService.createUser({
      name: registerDto.name,
      email: registerDto.email,
      password: registerDto.password,
      phone: registerDto.phone,
    });

    return this.issueTokens(user, 'Registration successful');
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    let payload: RefreshPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshPayload>(refreshTokenDto.refreshToken, {
        secret: this.jwtSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid or revoked refresh token');
    }

    const user = await this.usersService.findByEmail(payload.email);
    if (!user || user.id !== payload.sub || !user.isActive || user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('User session is no longer active');
    }

    const rotatedUser = await this.usersService.incrementTokenVersion(user.id);
    if (!rotatedUser) throw new UnauthorizedException('User session is no longer active');
    return this.issueTokens(rotatedUser, 'Token refreshed');
  }

  async logout(refreshTokenDto: RefreshTokenDto): Promise<{ message: string }> {
    try {
      const payload = this.jwtService.verify<RefreshPayload>(refreshTokenDto.refreshToken, {
        secret: this.jwtSecret,
      });
      if (payload.type === 'refresh') await this.usersService.incrementTokenVersion(payload.sub);
    } catch {
      // Logout remains idempotent when the refresh token is already expired or revoked.
    }

    return { message: 'Logout successful' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Don't reveal if email exists — return success either way
      return { message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.' };
    }

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = token;
    user.passwordResetExpires = expires;
    await this.usersService.saveUser(user);

    const resetUrl = `${this.config.get<string>('FRONTEND_URL', 'http://localhost:5173')}/reset-password?token=${token}`;
    await this.emailProvider.send(
      user.email,
      'Redefinição de Senha — Central de Manutenção',
      passwordResetEmailTemplate(resetUrl, user.name),
    );

    return { message: 'Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByResetToken(resetPasswordDto.token);
    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    user.password = await hash(resetPasswordDto.password, 12);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.tokenVersion += 1; // Invalidate all existing sessions
    await this.usersService.saveUser(user);

    return { message: 'Senha redefinida com sucesso' };
  }

  private async issueTokens(user: User, message: string): Promise<AuthResponse> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
      tokenVersion: user.tokenVersion,
    });
    const refreshToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
      tokenId: randomUUID(),
      tokenVersion: user.tokenVersion,
    }, { expiresIn: this.refreshTokenTtl });

    const { password: _password, ...safeUser } = user;
    return { message, accessToken, refreshToken, user: safeUser };
  }
}
