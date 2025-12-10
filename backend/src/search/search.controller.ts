import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import {SearchService, SearchOptions} from './search.service'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'

class SearchQueryDto {
  query: string
  entityTypes?: string[]
  phonetic?: boolean
  fuzzy?: boolean
  limit?: number
  offset?: number
}

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({summary: 'Advanced search with phonetic matching'})
  @ApiResponse({status: 200, description: 'Search results returned'})
  async search(@Query() query: SearchQueryDto) {
    const options: SearchOptions = {
      query: query.query,
      entityTypes: query.entityTypes || [],
      phonetic: query.phonetic === true || String(query.phonetic) === 'true',
      fuzzy: query.fuzzy === true || String(query.fuzzy) === 'true',
      limit: query.limit ? parseInt(String(query.limit)) : 20,
      offset: query.offset ? parseInt(String(query.offset)) : 0,
    }

    return this.searchService.search(options)
  }

  @Post('reindex/:entityType')
  @ApiOperation({summary: 'Reindex all entities of a given type'})
  @ApiResponse({status: 200, description: 'Reindexing completed'})
  async reindex(@Param('entityType') entityType: string) {
    const count = await this.searchService.reindexAll(entityType)
    return {
      success: true,
      entityType,
      indexed: count,
    }
  }

  @Get('statistics')
  @ApiOperation({summary: 'Get search index statistics'})
  @ApiResponse({status: 200, description: 'Statistics returned'})
  async getStatistics() {
    return this.searchService.getStatistics()
  }
}
