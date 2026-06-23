import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  UseGuards,
  Req,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoggerDto } from './dto/logger.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

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
    const session = await this.authService.login(dto);

    const accessCookieName =
      this.configService.get<string>('AUTH_COOKIE_NAME') || 'auth_token';
    const refreshCookieName =
      this.configService.get<string>('REFRESH_COOKIE_NAME') || 'refresh_token';
    const secureFlag =
      this.configService.get<string>('COOKIE_SECURE') === 'true';
    const accessMaxAge = parseInt(
      this.configService.get<string>('COOKIE_MAX_AGE') ||
        String(1000 * 60 * 60),
      10,
    );
    const refreshMaxAge = parseInt(
      this.configService.get<string>('REFRESH_TOKEN_MAX_AGE') ||
        String(7 * 24 * 60 * 60 * 1000),
      10,
    );

    res.cookie(accessCookieName, session.accessToken, {
      httpOnly: true,
      secure: secureFlag,
      sameSite: 'lax',
      maxAge: accessMaxAge,
    });

    res.cookie(refreshCookieName, session.refreshToken, {
      httpOnly: true,
      secure: secureFlag,
      sameSite: 'lax',
      maxAge: refreshMaxAge,
    });

    return {
      success: true,
      expiresIn: session.expiresIn,
      refreshExpiresIn: session.refreshExpiresIn,
    };
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
  async googleAuthRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as
      | { id: string; username?: string | null; email: string }
      | undefined;

    // Pre-compute cookie names / flags so we can clear them if an error occurs
    const accessCookieName =
      this.configService.get<string>('AUTH_COOKIE_NAME') || 'auth_token';
    const refreshCookieName =
      this.configService.get<string>('REFRESH_COOKIE_NAME') || 'refresh_token';
    const secureFlag =
      this.configService.get<string>('COOKIE_SECURE') === 'true';

    try {
      if (!user?.id || !user.email) {
        throw new UnauthorizedException('Usuario de Google no autenticado');
      }

      const session = await this.authService.createSessionTokens(user);

      const accessMaxAge = parseInt(
        this.configService.get<string>('COOKIE_MAX_AGE') ||
          String(1000 * 60 * 60),
        10,
      );
      const refreshMaxAge = parseInt(
        this.configService.get<string>('REFRESH_TOKEN_MAX_AGE') ||
          String(7 * 24 * 60 * 60 * 1000),
        10,
      );

      res.cookie(accessCookieName, session.accessToken, {
        httpOnly: true,
        secure: secureFlag,
        sameSite: 'lax',
        maxAge: accessMaxAge,
      });

      res.cookie(refreshCookieName, session.refreshToken, {
        httpOnly: true,
        secure: secureFlag,
        sameSite: 'lax',
        maxAge: refreshMaxAge,
      });

      const redirectUrl =
        this.configService.get<string>('GOOGLE_REDIRECT_URL') ||
        'http://localhost:5173/home';

      res.redirect(redirectUrl);
    } catch (err) {
      // Log full error for debugging and clear any cookies that may exist
      // so the client isn't left with stale tokens.
      // eslint-disable-next-line no-console
      console.error('Error handling Google callback:', err);

      try {
        res.clearCookie(accessCookieName, {
          httpOnly: true,
          secure: secureFlag,
          sameSite: 'lax',
        });
        res.clearCookie(refreshCookieName, {
          httpOnly: true,
          secure: secureFlag,
          sameSite: 'lax',
        });
      } catch (clearErr) {
        // eslint-disable-next-line no-console
        console.error(
          'Error clearing cookies after Google callback failure:',
          clearErr,
        );
      }

      throw new InternalServerErrorException(
        'Error procesando callback de Google',
      );
    }
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshCookieName =
      this.configService.get<string>('REFRESH_COOKIE_NAME') || 'refresh_token';
    const rawRefreshToken = req.cookies?.[refreshCookieName];
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token no encontrado');
    }

    const session = await this.authService.rotateRefreshToken(rawRefreshToken);
    const accessCookieName =
      this.configService.get<string>('AUTH_COOKIE_NAME') || 'auth_token';
    const secureFlag =
      this.configService.get<string>('COOKIE_SECURE') === 'true';
    const accessMaxAge = parseInt(
      this.configService.get<string>('COOKIE_MAX_AGE') ||
        String(1000 * 60 * 60),
      10,
    );
    const refreshMaxAge = parseInt(
      this.configService.get<string>('REFRESH_TOKEN_MAX_AGE') ||
        String(7 * 24 * 60 * 60 * 1000),
      10,
    );

    res.cookie(accessCookieName, session.accessToken, {
      httpOnly: true,
      secure: secureFlag,
      sameSite: 'lax',
      maxAge: accessMaxAge,
    });

    res.cookie(refreshCookieName, session.refreshToken, {
      httpOnly: true,
      secure: secureFlag,
      sameSite: 'lax',
      maxAge: refreshMaxAge,
    });

    return {
      success: true,
      expiresIn: session.expiresIn,
      refreshExpiresIn: session.refreshExpiresIn,
    };
  }

  @Public()
  @Get('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const accessCookieName =
      this.configService.get<string>('AUTH_COOKIE_NAME') || 'auth_token';
    const refreshCookieName =
      this.configService.get<string>('REFRESH_COOKIE_NAME') || 'refresh_token';
    const secureFlag =
      this.configService.get<string>('COOKIE_SECURE') === 'true';
    const currentRefreshToken = req.cookies?.[refreshCookieName];

    if (currentRefreshToken) {
      await this.authService.revokeRefreshToken(currentRefreshToken);
    }

    res.clearCookie(accessCookieName, {
      httpOnly: true,
      secure: secureFlag,
      sameSite: 'lax',
    });
    res.clearCookie(refreshCookieName, {
      httpOnly: true,
      secure: secureFlag,
      sameSite: 'lax',
    });

    return { success: true, message: 'Sesión cerrada correctamente' };
  }

  @Get('me')
  getProfile(@CurrentUser() user: JwtPayload) {
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
