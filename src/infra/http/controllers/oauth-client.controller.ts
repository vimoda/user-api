import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { CreateOAuthClientUseCase } from '../../../application/use-cases/create-oauth-client.usecase';
import { ListOAuthClientsUseCase } from '../../../application/use-cases/list-oauth-clients.usecase';
import { UpdateOAuthClientUseCase } from '../../../application/use-cases/update-oauth-client.usecase';
import { DeleteOAuthClientUseCase } from '../../../application/use-cases/delete-oauth-client.usecase';
import { CreateOAuthClientDto } from '../../../application/dto/create-oauth-client.dto';
import { UpdateOAuthClientDto } from '../../../application/dto/update-oauth-client.dto';

@ApiTags('OAuth Clients')
@ApiBearerAuth()
@Controller('oauth/clients')
@UseGuards(AdminGuard)
export class OAuthClientController {
  constructor(
    private readonly createOAuthClientUseCase: CreateOAuthClientUseCase,
    private readonly listOAuthClientsUseCase: ListOAuthClientsUseCase,
    private readonly updateOAuthClientUseCase: UpdateOAuthClientUseCase,
    private readonly deleteOAuthClientUseCase: DeleteOAuthClientUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new OAuth client' })
  @ApiResponse({ status: 201, description: 'OAuth client created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin access required' })
  async create(@Body() dto: CreateOAuthClientDto, @Request() req: any) {
    const userId = req.user.id;
    return this.createOAuthClientUseCase.execute(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all OAuth clients created by the current admin user' })
  @ApiResponse({ status: 200, description: 'List of OAuth clients' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin access required' })
  async list(@Request() req: any) {
    const userId = req.user.id;
    return this.listOAuthClientsUseCase.execute(userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an OAuth client' })
  @ApiResponse({ status: 200, description: 'OAuth client updated successfully' })
  @ApiResponse({ status: 404, description: 'OAuth client not found or access denied' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin access required' })
  async update(@Param('id') id: string, @Body() dto: UpdateOAuthClientDto, @Request() req: any) {
    const userId = req.user.id;
    return this.updateOAuthClientUseCase.execute(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an OAuth client' })
  @ApiResponse({ status: 204, description: 'OAuth client deleted successfully' })
  @ApiResponse({ status: 404, description: 'OAuth client not found or access denied' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Admin access required' })
  async delete(@Param('id') id: string, @Request() req: any) {
    const userId = req.user.id;
    await this.deleteOAuthClientUseCase.execute(id, userId);
  }
}