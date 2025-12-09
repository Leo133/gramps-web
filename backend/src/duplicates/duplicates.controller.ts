import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DuplicatesService } from './duplicates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('duplicates')
@Controller('duplicates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DuplicatesController {
  constructor(private readonly duplicatesService: DuplicatesService) {}

  @Post('scan')
  @ApiOperation({ summary: 'Scan for duplicate records' })
  @ApiResponse({ status: 200, description: 'Scan completed' })
  async scanForDuplicates(@Query('minSimilarity') minSimilarity?: string) {
    const threshold = minSimilarity ? parseFloat(minSimilarity) : 0.7;
    const suggestions = await this.duplicatesService.findDuplicatePeople(threshold);
    
    return {
      success: true,
      found: suggestions.length,
      suggestions,
    };
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending duplicate suggestions' })
  @ApiResponse({ status: 200, description: 'Suggestions returned' })
  async getPending(@Query('entityType') entityType?: string) {
    return this.duplicatesService.getPendingSuggestions(entityType);
  }

  @Post(':id/review')
  @ApiOperation({ summary: 'Review a duplicate suggestion' })
  @ApiResponse({ status: 200, description: 'Suggestion updated' })
  async reviewSuggestion(
    @Param('id') id: string,
    @Body() body: { status: 'merged' | 'dismissed' },
    @CurrentUser() user: any,
  ) {
    return this.duplicatesService.updateSuggestionStatus(id, body.status, user.id);
  }

  @Post('merge')
  @ApiOperation({ summary: 'Merge two duplicate records' })
  @ApiResponse({ status: 200, description: 'Records merged' })
  async merge(
    @Body() body: { handle1: string; handle2: string; keepHandle: string },
  ) {
    return this.duplicatesService.mergePeople(
      body.handle1,
      body.handle2,
      body.keepHandle,
    );
  }
}
