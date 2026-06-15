import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoggerDto } from './dto/logger.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: dto.username,
      },
    });
    if (user) throw new ConflictException('El usuario ya está registrado');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);
    return await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
      },
    });
  }

  async login(dto: LoggerDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (!user) throw new NotFoundException('Usuario no registrado');
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Credenciales inválidas');
    return {
      exito: true,
    };
  }
}
