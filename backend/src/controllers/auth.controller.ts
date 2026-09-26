import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { JwtGuard } from '../core/guards/jwt.guard';
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

  @Get('me')
  @UseGuards(JwtGuard)
  me(@CurrentUser() user: RequestUser): RequestUser { return user; }

  @Post('logout')
  logout(@Body() dto: RefreshTokenDto): Promise<{ message: string }> { return this.authService.logout(dto); }
}
