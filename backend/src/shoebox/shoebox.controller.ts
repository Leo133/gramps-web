import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import {
  ShoeboxService,
  CreateShoeboxItemDto,
  UpdateShoeboxItemDto,
} from './shoebox.service'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import {CurrentUser} from '../auth/decorators/current-user.decorator'

@ApiTags('shoebox')
@Controller('shoebox')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ShoeboxController {
  constructor(private readonly shoeboxService: ShoeboxService) {}

  @Post('items')
  @ApiOperation({summary: 'Add item to shoebox'})
  @ApiResponse({status: 201, description: 'Item added'})
  async addItem(@CurrentUser() user: any, @Body() data: CreateShoeboxItemDto) {
    return this.shoeboxService.addItem(user.id, data)
  }

  @Get('items')
  @ApiOperation({summary: 'Get all shoebox items'})
  @ApiResponse({status: 200, description: 'Items returned'})
  async getItems(
    @CurrentUser() user: any,
    @Query('itemType') itemType?: string,
    @Query('tag') tag?: string,
  ) {
    return this.shoeboxService.getUserItems(user.id, {itemType, tag})
  }

  @Get('items/:id')
  @ApiOperation({summary: 'Get a single shoebox item'})
  @ApiResponse({status: 200, description: 'Item returned'})
  async getItem(@Param('id') id: string, @CurrentUser() user: any) {
    return this.shoeboxService.getItem(id, user.id)
  }

  @Put('items/:id')
  @ApiOperation({summary: 'Update a shoebox item'})
  @ApiResponse({status: 200, description: 'Item updated'})
  async updateItem(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() data: UpdateShoeboxItemDto,
  ) {
    return this.shoeboxService.updateItem(id, user.id, data)
  }

  @Delete('items/:id')
  @ApiOperation({summary: 'Delete a shoebox item'})
  @ApiResponse({status: 200, description: 'Item deleted'})
  async deleteItem(@Param('id') id: string, @CurrentUser() user: any) {
    await this.shoeboxService.deleteItem(id, user.id)
    return {success: true}
  }

  @Post('items/:id/attach')
  @ApiOperation({summary: 'Attach item to a genealogy entity'})
  @ApiResponse({status: 200, description: 'Item attached'})
  async attachToEntity(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() data: {entityType: string; entityHandle: string},
  ) {
    return this.shoeboxService.attachToEntity(
      id,
      user.id,
      data.entityType,
      data.entityHandle,
    )
  }

  @Get('statistics')
  @ApiOperation({summary: 'Get shoebox statistics'})
  @ApiResponse({status: 200, description: 'Statistics returned'})
  async getStatistics(@CurrentUser() user: any) {
    return this.shoeboxService.getStatistics(user.id)
  }
}
