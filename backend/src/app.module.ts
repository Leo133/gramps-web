import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PeopleModule } from './people/people.module';
import { FamiliesModule } from './families/families.module';
import { EventsModule } from './events/events.module';
import { PlacesModule } from './places/places.module';
import { SourcesModule } from './sources/sources.module';
import { CitationsModule } from './citations/citations.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { MediaModule } from './media/media.module';
import { NotesModule } from './notes/notes.module';
import { MetadataModule } from './metadata/metadata.module';

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
    SourcesModule,
    CitationsModule,
    RepositoriesModule,
    MediaModule,
    NotesModule,
    MetadataModule,
  ],
})
export class AppModule {}
