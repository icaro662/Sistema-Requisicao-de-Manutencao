import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { JwtGuard } from '../core/guards/jwt.guard';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dtos/auth/login.dto';
import { RefreshTokenDto } from '../dtos/auth/refresh-token.dto';
import { RegisterDto } from '../dtos/auth/register.dto';
import { ForgotPasswordDto } from '../dtos/auth/forgot-password.dto';
import { ResetPasswordDto } from '../dtos/auth/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) { return this.authService.login(dto); }

  @Post('register')
  register(@Body() dto: RegisterDto) { return this.authService.register(dto); }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) { return this.authService.refresh(dto); }

  @Get('me')
  @UseGuards(JwtGuard)
  me(@CurrentUser() user: RequestUser): RequestUser { return user; }

  @Post('logout')
  logout(@Body() dto: RefreshTokenDto): Promise<{ message: string }> { return this.authService.logout(dto); }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(dto);
  }
}
