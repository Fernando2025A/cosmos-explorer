import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoggerDto } from './dto/logger.dto';
import { randomBytes } from 'node:crypto';
import { MailService } from 'src/mail/mail.service';
import { Resend } from 'resend';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthProvider, TokenType } from 'generated/prisma/client';
import { JWT_EXPIRES_IN, RESEND_API_KEY } from './auth.constants';

interface GoogleProfile {
  displayName?: string;
  emails?: Array<{ value?: string }>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: dto.username }, { email: dto.email }],
      },
    });

    if (existingUser) {
      throw new ConflictException('El usuario ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
        provider: AuthProvider.LOCAL,
      },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
      },
    });

    const verificationToken = randomBytes(32).toString('hex');
    await this.prisma.userToken.create({
      data: {
        token: verificationToken,
        type: TokenType.EMAIL_VERIFICATION,
        userId: newUser.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return {
      success: true,
      user: newUser,
    };
  }

  async testEmail() {
    const resendKey = this.configService.get<string>(RESEND_API_KEY);
    if (!resendKey) {
      throw new Error(`${RESEND_API_KEY} is not configured`);
    }

    const resend = new Resend(resendKey);
    return resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'mccofin23@gmail.com',
      subject: 'Verificar email',
      html: '<h1>Hola</h1>',
    });
  }

  async login(dto: LoggerDto) {
    const identifier = dto.identifier?.trim();
    if (!identifier) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const normalizedEmail = identifier.toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: normalizedEmail },
        ],
      },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      token: this.getJwtForUser(user),
      expiresIn: this.configService.get<string>(JWT_EXPIRES_IN, '1h'),
    };
  }

  async findOrCreateGoogleUser(profile: GoogleProfile) {
    const email =
      typeof profile.emails?.[0]?.value === 'string'
        ? profile.emails[0].value.toLowerCase()
        : undefined;

    if (!email) {
      throw new UnauthorizedException(
        'No se encontró correo en el perfil de Google',
      );
    }

    const displayName =
      typeof profile.displayName === 'string'
        ? profile.displayName
        : undefined;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          emailVerified: true,
          provider: AuthProvider.GOOGLE,
          username: existingUser.username || displayName,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        email,
        username: displayName,
        emailVerified: true,
        provider: AuthProvider.GOOGLE,
      },
    });
  }

  getJwtForUser(user: { id: string; username?: string | null; email: string }) {
    return this.jwtService.sign({
      sub: user.id,
      username: user.username,
      email: user.email,
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
    };
  }
}
