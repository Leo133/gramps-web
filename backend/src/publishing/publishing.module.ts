import {Module} from '@nestjs/common'
import {PrismaModule} from '../prisma/prisma.module'
import {PublishingController, PublicController} from './publishing.controller'
import {SiteGeneratorService} from './services/site-generator.service'
import {ShareLinkService} from './services/share-link.service'
import {ExportService} from './services/export.service'
import {EmbedService} from './services/embed.service'
import {ApiKeyService} from './services/api-key.service'
import {WebhookService} from './services/webhook.service'
import {SocialService} from './services/social.service'

@Module({
  imports: [PrismaModule],
  controllers: [PublishingController, PublicController],
  providers: [
    SiteGeneratorService,
    ShareLinkService,
    ExportService,
    EmbedService,
    ApiKeyService,
    WebhookService,
    SocialService,
  ],
  exports: [
    SiteGeneratorService,
    ShareLinkService,
    ExportService,
    EmbedService,
    ApiKeyService,
    WebhookService,
    SocialService,
  ],
})
export class PublishingModule {}
