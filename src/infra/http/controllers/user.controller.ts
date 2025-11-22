import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe, UseGuards, Request, Put } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from '../../../application/dto/create-user.dto';
import { LoginDto } from '../../../application/dto/login.dto';
import { RefreshTokenDto } from '../../../application/dto/refresh-token.dto';
import { ValidateTokenDto } from '../../../application/dto/validate-token.dto';
import { UpdateUserRolesDto } from '../../../application/dto/update-user-roles.dto';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.usecase';
import { LoginUseCase } from '../../../application/use-cases/login.usecase';
import { RefreshTokenUseCase } from '../../../application/use-cases/refresh-token.usecase';
import { ValidateTokenUseCase } from '../../../application/use-cases/validate-token.usecase';
import { UpdateUserRolesUseCase } from '../../../application/use-cases/update-user-roles.usecase';
import { FindUserByIdUseCase } from '../../../application/use-cases/find-user-by-id.usecase';
import { UserAlreadyExistsException } from '../../../infra/http/exceptions/business.exceptions';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly validateTokenUseCase: ValidateTokenUseCase,
    private readonly updateUserRolesUseCase: UpdateUserRolesUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase
  ) {}

  @Post()
  @UseGuards(AdminGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Registrar nuevo usuario (solo administradores)' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - se requiere rol admin' })
  @ApiResponse({ status: 409, description: 'Usuario ya existe' })
  async register(@Body() dto: CreateUserDto) {
    const user = await this.createUserUseCase.execute(dto);
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified
    };
  }

  @Post('setup-admin')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 requests per hour for setup
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Crear primer usuario administrador (solo si no existen usuarios)' })
  @ApiResponse({ status: 201, description: 'Usuario admin creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Ya existe un usuario admin o el email ya está registrado' })
  async setupAdmin(@Body() dto: CreateUserDto) {
    try {
      // Try to create the user - if it fails with UserAlreadyExistsException,
      // it means the email is taken
      const adminUser = await this.createUserUseCase.execute({
        email: dto.email,
        phone: dto.phone,
        password: dto.password
      });

      // Update the user to have admin role
      const updatedUser = await this.updateUserRolesUseCase.execute({
        userId: adminUser.id,
        roles: ['admin']
      });

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        phone: updatedUser.phone,
        roles: updatedUser.roles,
        isEmailVerified: updatedUser.isEmailVerified,
        isPhoneVerified: updatedUser.isPhoneVerified,
        message: 'Admin user created successfully. Use this endpoint only once for initial setup.'
      };
    } catch (error) {
      if (error instanceof UserAlreadyExistsException) {
        throw error;
      }
      throw error;
    }
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 600000 } }) // 5 requests per 10 minutes
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso, retorna tokens' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Post('refresh')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Refrescar token de acceso' })
  @ApiResponse({ status: 200, description: 'Nuevo token generado' })
  @ApiResponse({ status: 401, description: 'Token de refresh inválido' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(dto.refresh_token);
  }

  @Post('validate')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Validar token JWT' })
  @ApiResponse({ status: 200, description: 'Token válido' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  async validate(@Body() dto: ValidateTokenDto) {
    return this.validateTokenUseCase.execute(dto.token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener información del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Información del usuario' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async me(@Request() req: any) {
    // Get full user information from database
    return this.findUserByIdUseCase.execute(req.user.id);
  }

  @Put(':id/roles')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar roles de un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Roles actualizados exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async updateRoles(@Param('id') id: string, @Body() dto: UpdateUserRolesDto) {
    const user = await this.updateUserRolesUseCase.execute({ userId: id, roles: dto.roles });
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findById(@Param('id') id: string) {
    return this.findUserByIdUseCase.execute(id);
  }
}
