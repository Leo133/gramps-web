import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Put, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
  Response
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PeopleService } from './people.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response as ExpressResponse } from 'express';

@ApiTags('people')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new person' })
  @ApiResponse({ status: 201, description: 'Person created successfully' })
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.peopleService.create(createPersonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all people' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pagesize', required: false, type: Number })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({ name: 'gramps_id', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns paginated list of people' })
  async findAll(
    @Query() query: { page?: number; pagesize?: number; q?: string; gramps_id?: string },
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const { people, total } = await this.peopleService.findAll(query);
    
    res.setHeader('X-Total-Count', total.toString());
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
    
    return people;
  }

  @Get(':handle')
  @ApiOperation({ summary: 'Get person by handle' })
  @ApiResponse({ status: 200, description: 'Returns person' })
  @ApiResponse({ status: 404, description: 'Person not found' })
  findOne(@Param('handle') handle: string) {
    return this.peopleService.findOne(handle);
  }

  @Put(':handle')
  @ApiOperation({ summary: 'Update person' })
  @ApiResponse({ status: 200, description: 'Person updated successfully' })
  update(@Param('handle') handle: string, @Body() updatePersonDto: UpdatePersonDto) {
    return this.peopleService.update(handle, updatePersonDto);
  }

  @Delete(':handle')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete person' })
  @ApiResponse({ status: 204, description: 'Person deleted successfully' })
  remove(@Param('handle') handle: string) {
    return this.peopleService.remove(handle);
  }
}
