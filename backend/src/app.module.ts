import {Module} from '@nestjs/common'
import {ConfigModule} from '@nestjs/config'
import {PrismaModule} from './prisma/prisma.module'
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
import {AiModule} from './ai/ai.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
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
    AiModule,
  ],
})
export class AppModule {}
