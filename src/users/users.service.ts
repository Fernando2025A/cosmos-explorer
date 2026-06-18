import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user)
      throw new NotFoundException(
        'No se encontró un usuario con el email proporcionado',
      );
    return user;
  }
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user)
      throw new NotFoundException(
        'No se encontró un usuario con el id proporcionado',
      );
    return user;
  }
}
