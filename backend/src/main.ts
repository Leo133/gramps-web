import {NestFactory} from '@nestjs/core'
import {ValidationPipe} from '@nestjs/common'
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger'
import {AppModule} from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  )

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8001',
    credentials: true,
  })

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Gramps Web API')
    .setDescription('The Gramps Web genealogy platform API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT || 5555
  await app.listen(port)
  console.log(`🚀 Gramps Web API is running on: http://localhost:${port}`)
  console.log(
    `📚 API Documentation available at: http://localhost:${port}/api/docs`,
  )
}

bootstrap()
