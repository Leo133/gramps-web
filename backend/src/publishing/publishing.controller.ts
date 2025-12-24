import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common'
import {ApiTags, ApiBearerAuth, ApiOperation, ApiResponse} from '@nestjs/swagger'
import {SiteGeneratorService} from './services/site-generator.service'
import {ShareLinkService} from './services/share-link.service'
import {ExportService} from './services/export.service'
import {EmbedService} from './services/embed.service'
import {ApiKeyService} from './services/api-key.service'
import {WebhookService} from './services/webhook.service'
import {SocialService} from './services/social.service'
import {
  CreateSiteDto,
  UpdateSiteDto,
  CreateShareLinkDto,
  AccessShareDto,
  CreateExportDto,
  CreateEmbedDto,
  CreateApiKeyDto,
  CreateWebhookDto,
  CalendarExportDto,
} from './dto/publishing.dto'

@ApiTags('Publishing')
@ApiBearerAuth('JWT-auth')
@Controller('api/publishing')
export class PublishingController {
  constructor(
    private readonly siteGeneratorService: SiteGeneratorService,
    private readonly shareLinkService: ShareLinkService,
    private readonly exportService: ExportService,
    private readonly embedService: EmbedService,
    private readonly apiKeyService: ApiKeyService,
    private readonly webhookService: WebhookService,
    private readonly socialService: SocialService,
  ) {}

  // ========== Site Generation Endpoints ==========

  @Get('themes')
  @ApiOperation({summary: 'Get available site themes'})
  getThemes() {
    return this.siteGeneratorService.getThemes()
  }

  @Post('sites')
  @ApiOperation({summary: 'Create a new published site'})
  createSite(@Req() req: any, @Body() dto: CreateSiteDto) {
    const userId = req.user?.id || 'demo-user'
    return this.siteGeneratorService.createSite(userId, dto)
  }

  @Get('sites')
  @ApiOperation({summary: 'Get all sites for current user'})
  getUserSites(@Req() req: any) {
    const userId = req.user?.id || 'demo-user'
    return this.siteGeneratorService.getUserSites(userId)
  }

  @Get('sites/:id')
  @ApiOperation({summary: 'Get a specific site'})
  getSite(@Req() req: any, @Param('id') siteId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.siteGeneratorService.getSite(userId, siteId)
  }

  @Put('sites/:id')
  @ApiOperation({summary: 'Update a site'})
  updateSite(@Req() req: any, @Param('id') siteId: string, @Body() dto: UpdateSiteDto) {
    const userId = req.user?.id || 'demo-user'
    return this.siteGeneratorService.updateSite(userId, siteId, dto)
  }

  @Post('sites/:id/publish')
  @ApiOperation({summary: 'Publish a site'})
  publishSite(@Req() req: any, @Param('id') siteId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.siteGeneratorService.publishSite(userId, siteId)
  }

  @Post('sites/:id/unpublish')
  @ApiOperation({summary: 'Unpublish a site'})
  unpublishSite(@Req() req: any, @Param('id') siteId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.siteGeneratorService.unpublishSite(userId, siteId)
  }

  @Get('sites/:id/preview')
  @ApiOperation({summary: 'Get preview URL for a site'})
  getPreviewUrl(@Req() req: any, @Param('id') siteId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.siteGeneratorService.getPreviewUrl(userId, siteId)
  }

  @Delete('sites/:id')
  @ApiOperation({summary: 'Delete a site'})
  deleteSite(@Req() req: any, @Param('id') siteId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.siteGeneratorService.deleteSite(userId, siteId)
  }

  // ========== Share Link Endpoints ==========

  @Post('shares')
  @ApiOperation({summary: 'Create a new share link'})
  createShareLink(@Req() req: any, @Body() dto: CreateShareLinkDto) {
    const userId = req.user?.id || 'demo-user'
    return this.shareLinkService.createShareLink(userId, dto)
  }

  @Get('shares')
  @ApiOperation({summary: 'Get all share links for current user'})
  getUserShareLinks(@Req() req: any) {
    const userId = req.user?.id || 'demo-user'
    return this.shareLinkService.getUserShareLinks(userId)
  }

  @Get('shares/:id')
  @ApiOperation({summary: 'Get a specific share link'})
  getShareLink(@Req() req: any, @Param('id') linkId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.shareLinkService.getShareLink(userId, linkId)
  }

  @Post('shares/:id/disable')
  @ApiOperation({summary: 'Disable a share link'})
  disableShareLink(@Req() req: any, @Param('id') linkId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.shareLinkService.disableShareLink(userId, linkId)
  }

  @Post('shares/:id/enable')
  @ApiOperation({summary: 'Enable a share link'})
  enableShareLink(@Req() req: any, @Param('id') linkId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.shareLinkService.enableShareLink(userId, linkId)
  }

  @Delete('shares/:id')
  @ApiOperation({summary: 'Delete a share link'})
  deleteShareLink(@Req() req: any, @Param('id') linkId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.shareLinkService.deleteShareLink(userId, linkId)
  }

  // ========== Export Endpoints ==========

  @Get('export-formats')
  @ApiOperation({summary: 'Get available export formats'})
  getExportFormats() {
    return this.exportService.getExportFormats()
  }

  @Post('exports')
  @ApiOperation({summary: 'Create a new export job'})
  createExport(@Req() req: any, @Body() dto: CreateExportDto) {
    const userId = req.user?.id || 'demo-user'
    return this.exportService.createExport(userId, dto)
  }

  @Get('exports')
  @ApiOperation({summary: 'Get all exports for current user'})
  getUserExports(@Req() req: any) {
    const userId = req.user?.id || 'demo-user'
    return this.exportService.getUserExports(userId)
  }

  @Get('exports/:id')
  @ApiOperation({summary: 'Get export status'})
  getExport(@Req() req: any, @Param('id') exportId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.exportService.getExport(userId, exportId)
  }

  @Get('exports/:id/download')
  @ApiOperation({summary: 'Download export file'})
  downloadExport(@Req() req: any, @Param('id') exportId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.exportService.downloadExport(userId, exportId)
  }

  @Delete('exports/:id')
  @ApiOperation({summary: 'Delete an export'})
  deleteExport(@Req() req: any, @Param('id') exportId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.exportService.deleteExport(userId, exportId)
  }

  // ========== Embed Widget Endpoints ==========

  @Get('widget-types')
  @ApiOperation({summary: 'Get available widget types'})
  getWidgetTypes() {
    return this.embedService.getWidgetTypes()
  }

  @Post('embed')
  @ApiOperation({summary: 'Generate embed code'})
  generateEmbedCode(@Req() req: any, @Body() dto: CreateEmbedDto) {
    const userId = req.user?.id || 'demo-user'
    return this.embedService.generateEmbedCode(userId, dto)
  }

  @Get('embed/:token')
  @ApiOperation({summary: 'Render embed widget'})
  renderWidget(@Param('token') token: string) {
    return this.embedService.renderWidget(token)
  }

  // ========== API Key Endpoints ==========

  @Get('api-keys/permissions')
  @ApiOperation({summary: 'Get available API key permissions'})
  getAvailablePermissions() {
    return this.apiKeyService.getAvailablePermissions()
  }

  @Post('api-keys')
  @ApiOperation({summary: 'Create a new API key'})
  @ApiResponse({status: 201, description: 'API key created. Save the key - it won\'t be shown again.'})
  createApiKey(@Req() req: any, @Body() dto: CreateApiKeyDto) {
    const userId = req.user?.id || 'demo-user'
    return this.apiKeyService.createApiKey(userId, dto)
  }

  @Get('api-keys')
  @ApiOperation({summary: 'Get all API keys for current user'})
  getUserApiKeys(@Req() req: any) {
    const userId = req.user?.id || 'demo-user'
    return this.apiKeyService.getUserApiKeys(userId)
  }

  @Get('api-keys/:id')
  @ApiOperation({summary: 'Get a specific API key'})
  getApiKey(@Req() req: any, @Param('id') keyId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.apiKeyService.getApiKey(userId, keyId)
  }

  @Get('api-keys/:id/stats')
  @ApiOperation({summary: 'Get API key usage statistics'})
  getApiKeyStats(@Req() req: any, @Param('id') keyId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.apiKeyService.getApiKeyStats(userId, keyId)
  }

  @Post('api-keys/:id/enable')
  @ApiOperation({summary: 'Enable an API key'})
  enableApiKey(@Req() req: any, @Param('id') keyId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.apiKeyService.toggleApiKey(userId, keyId, true)
  }

  @Post('api-keys/:id/disable')
  @ApiOperation({summary: 'Disable an API key'})
  disableApiKey(@Req() req: any, @Param('id') keyId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.apiKeyService.toggleApiKey(userId, keyId, false)
  }

  @Delete('api-keys/:id')
  @ApiOperation({summary: 'Revoke an API key'})
  revokeApiKey(@Req() req: any, @Param('id') keyId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.apiKeyService.revokeApiKey(userId, keyId)
  }

  // ========== Webhook Endpoints ==========

  @Get('webhooks/event-types')
  @ApiOperation({summary: 'Get available webhook event types'})
  getEventTypes() {
    return this.webhookService.getEventTypes()
  }

  @Post('webhooks')
  @ApiOperation({summary: 'Create a new webhook'})
  @ApiResponse({status: 201, description: 'Webhook created. Save the secret - it won\'t be shown again.'})
  createWebhook(@Req() req: any, @Body() dto: CreateWebhookDto) {
    const userId = req.user?.id || 'demo-user'
    return this.webhookService.createWebhook(userId, dto)
  }

  @Get('webhooks')
  @ApiOperation({summary: 'Get all webhooks for current user'})
  getUserWebhooks(@Req() req: any) {
    const userId = req.user?.id || 'demo-user'
    return this.webhookService.getUserWebhooks(userId)
  }

  @Get('webhooks/:id')
  @ApiOperation({summary: 'Get a specific webhook'})
  getWebhook(@Req() req: any, @Param('id') webhookId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.webhookService.getWebhook(userId, webhookId)
  }

  @Put('webhooks/:id')
  @ApiOperation({summary: 'Update a webhook'})
  updateWebhook(@Req() req: any, @Param('id') webhookId: string, @Body() dto: Partial<CreateWebhookDto>) {
    const userId = req.user?.id || 'demo-user'
    return this.webhookService.updateWebhook(userId, webhookId, dto)
  }

  @Post('webhooks/:id/test')
  @ApiOperation({summary: 'Test a webhook'})
  testWebhook(@Req() req: any, @Param('id') webhookId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.webhookService.testWebhook(userId, webhookId)
  }

  @Delete('webhooks/:id')
  @ApiOperation({summary: 'Delete a webhook'})
  deleteWebhook(@Req() req: any, @Param('id') webhookId: string) {
    const userId = req.user?.id || 'demo-user'
    return this.webhookService.deleteWebhook(userId, webhookId)
  }

  // ========== Social & Calendar Endpoints ==========

  @Get('social-card/:entityType/:entityId')
  @ApiOperation({summary: 'Generate social media card metadata'})
  generateSocialCard(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.socialService.generateSocialCard(entityType, entityId)
  }

  @Get('share-links/:entityType/:entityId')
  @ApiOperation({summary: 'Get social sharing links'})
  getShareLinks(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('url') url?: string,
  ) {
    return this.socialService.getShareLinks(entityType, entityId, url)
  }

  @Get('calendar/export')
  @ApiOperation({summary: 'Export calendar (birthdays, anniversaries)'})
  exportCalendar(@Req() req: any, @Query() dto: CalendarExportDto) {
    const userId = req.user?.id || 'demo-user'
    return this.socialService.exportCalendar(userId, dto)
  }
}

// ========== Public Access Controller (No Auth Required) ==========

@ApiTags('Public')
@Controller('api/public')
export class PublicController {
  constructor(
    private readonly shareLinkService: ShareLinkService,
    private readonly embedService: EmbedService,
  ) {}

  @Get('share/:token')
  @ApiOperation({summary: 'Access shared content (public)'})
  accessSharedContent(@Param('token') token: string, @Query() dto: AccessShareDto) {
    return this.shareLinkService.accessSharedContent(token, dto)
  }

  @Post('share/:token')
  @ApiOperation({summary: 'Access password-protected shared content'})
  accessProtectedContent(@Param('token') token: string, @Body() dto: AccessShareDto) {
    return this.shareLinkService.accessSharedContent(token, dto)
  }

  @Get('embed/:type/:token')
  @ApiOperation({summary: 'Render embedded widget'})
  renderWidget(@Param('token') token: string) {
    return this.embedService.renderWidget(token)
  }
}
