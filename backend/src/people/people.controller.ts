import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  Headers,
  Res,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger'
import {Response} from 'express'
import {PeopleService} from './people.service'
import {CreatePersonDto, UpdatePersonDto} from './dto/person.dto'
import {Roles} from '../auth/decorators/auth.decorator'

@ApiTags('People')
@ApiBearerAuth('JWT-auth')
@Controller('api/people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Post()
  @Roles('contributor', 'editor', 'owner')
  @ApiOperation({summary: 'Create a new person'})
  @ApiResponse({status: 201, description: 'Person created successfully'})
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.peopleService.create(createPersonDto)
  }

  @Get()
  @ApiOperation({summary: 'Get all people'})
  @ApiResponse({status: 200, description: 'List of people'})
  @ApiQuery({name: 'q', required: false, description: 'Search query'})
  @ApiQuery({name: 'page', required: false, description: 'Page number'})
  @ApiQuery({name: 'pagesize', required: false, description: 'Page size'})
  @ApiQuery({
    name: 'gramps_id',
    required: false,
    description: 'Filter by Gramps ID',
  })
  async findAll(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('pagesize') pagesize?: string,
    @Query('gramps_id') gramps_id?: string,
    @Res({passthrough: true}) res?: Response,
  ) {
    const result = await this.peopleService.findAll({
      q,
      page: page ? parseInt(page) : undefined,
      pagesize: pagesize ? parseInt(pagesize) : undefined,
      gramps_id,
    })

    // Set X-Total-Count header for pagination
    res?.setHeader('X-Total-Count', result.total.toString())
    res?.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')

    return result.data
  }

  @Get(':handle')
  @ApiOperation({summary: 'Get person by handle'})
  @ApiResponse({status: 200, description: 'Person details'})
  @ApiResponse({status: 404, description: 'Person not found'})
  findOne(@Param('handle') handle: string) {
    return this.peopleService.findOne(handle)
  }

  @Put(':handle')
  @Roles('contributor', 'editor', 'owner')
  @ApiOperation({summary: 'Update person'})
  @ApiResponse({status: 200, description: 'Person updated successfully'})
  @ApiResponse({status: 404, description: 'Person not found'})
  update(@Param('handle') handle: string, @Body() updatePersonDto: UpdatePersonDto) {
    return this.peopleService.update(handle, updatePersonDto)
  }

  @Delete(':handle')
  @Roles('editor', 'owner')
  @HttpCode(204)
  @ApiOperation({summary: 'Delete person'})
  @ApiResponse({status: 204, description: 'Person deleted successfully'})
  @ApiResponse({status: 404, description: 'Person not found'})
  remove(@Param('handle') handle: string) {
    return this.peopleService.remove(handle)
  }
}
