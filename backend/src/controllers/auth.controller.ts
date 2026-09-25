import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dtos/auth/login.dto';
import { RefreshTokenDto } from '../dtos/auth/refresh-token.dto';
import { RegisterDto } from '../dtos/auth/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) { return this.authService.login(dto); }

  @Post('register')
  register(@Body() dto: RegisterDto) { return this.authService.register(dto); }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) { return this.authService.refresh(dto); }

  @Post('logout')
  logout(): { message: string } { return { message: 'Logout flow ready for token revocation' }; }
}
