import {Module} from '@nestjs/common'
import {ConfigModule} from '@nestjs/config'
import {PrismaModule} from './prisma/prisma.module'
import {CacheModule} from './cache/cache.module'
import {AuthModule} from './auth/auth.module'
import {UsersModule} from './users/users.module'
import {PeopleModule} from './people/people.module'
import {FamiliesModule} from './families/families.module'
import {EventsModule} from './events/events.module'
import {PlacesModule} from './places/places.module'
import {MediaModule} from './media/media.module'
import {RepositoriesModule} from './repositories/repositories.module'
import {SourcesModule} from './sources/sources.module'
import {NotesModule} from './notes/notes.module'
import {MetadataModule} from './metadata/metadata.module'
import {TreeSettingsModule} from './tree-settings/tree-settings.module'
import {VisualizationsModule} from './visualizations/visualizations.module'
import {GeospatialModule} from './geospatial/geospatial.module'
import {SearchModule} from './search/search.module'
import {QualityCheckModule} from './quality-check/quality-check.module'
import {DuplicatesModule} from './duplicates/duplicates.module'
import {ResearchPlannerModule} from './research-planner/research-planner.module'
import {ShoeboxModule} from './shoebox/shoebox.module'
import {ChatModule} from './chat/chat.module'
import {CommentsModule} from './comments/comments.module'
import {ActivityFeedModule} from './activity-feed/activity-feed.module'
import {AiModule} from './ai/ai.module'
import {AdminModule} from './admin/admin.module'
import {GrampsXmlModule} from './gramps-xml/gramps-xml.module'
import {BlogModule} from './blog/blog.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CacheModule,
    AuthModule,
    UsersModule,
    PeopleModule,
    FamiliesModule,
    EventsModule,
    PlacesModule,
    MediaModule,
    RepositoriesModule,
    SourcesModule,
    NotesModule,
    MetadataModule,
    TreeSettingsModule,
    VisualizationsModule,
    GeospatialModule,
    SearchModule,
    QualityCheckModule,
    DuplicatesModule,
    ResearchPlannerModule,
    ShoeboxModule,
    ChatModule,
    CommentsModule,
    ActivityFeedModule,
    AiModule,
    AdminModule,
    GrampsXmlModule,
    BlogModule,
  ],
})
export class AppModule {}
