import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoggerDto } from './dto/logger.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  create(@Body() dto: CreateUserDto) {
    return this.authService.create(dto);
  }

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoggerDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, expiresIn } = await this.authService.login(dto);

    const cookieName =
      this.configService.get<string>('AUTH_COOKIE_NAME') || 'auth_token';
    const secureFlag =
      this.configService.get<string>('COOKIE_SECURE') === 'true';
    const maxAge = parseInt(
      this.configService.get<string>('COOKIE_MAX_AGE') ||
        String(1000 * 60 * 60),
      10,
    );

    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: secureFlag,
      sameSite: 'lax',
      maxAge,
    });

    return { success: true, expiresIn };
  }

  @Public()
  @Get('email')
  getEmail() {
    return this.authService.testEmail();
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    return;
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as
      | { id: string; username?: string | null; email: string }
      | undefined;
    if (!user?.id || !user.email) {
      throw new UnauthorizedException('Usuario de Google no autenticado');
    }

    const token = this.authService.getJwtForUser(user);
    const cookieName =
      this.configService.get<string>('AUTH_COOKIE_NAME') || 'auth_token';
    const secureFlag =
      this.configService.get<string>('COOKIE_SECURE') === 'true';
    const maxAge = parseInt(
      this.configService.get<string>('COOKIE_MAX_AGE') ||
        String(1000 * 60 * 60),
      10,
    );

    res.cookie(cookieName, token, {
      httpOnly: true,
      secure: secureFlag,
      sameSite: 'lax',
      maxAge,
    });

    return {
      success: true,
      message: 'Google login exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    const cookieName =
      this.configService.get<string>('AUTH_COOKIE_NAME') || 'auth_token';
    const secureFlag =
      this.configService.get<string>('COOKIE_SECURE') === 'true';

    res.clearCookie(cookieName, {
      httpOnly: true,
      secure: secureFlag,
      sameSite: 'lax',
    });

    return { success: true, message: 'Sesión cerrada correctamente' };
  }

  @Get('me')
  getProfile(@CurrentUser() user: unknown) {
    let userId: string | undefined;
    if (user && typeof user === 'object') {
      const u = user as Record<string, any>;
      if (u.id && typeof u.id === 'string') userId = u.id;
      else if (u.sub && typeof u.sub === 'string') userId = u.sub;
    }
    if (!userId) throw new UnauthorizedException('Usuario no autenticado');
    return this.authService.getMe(userId);
  }
}
