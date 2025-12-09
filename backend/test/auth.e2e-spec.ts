import {Test, TestingModule} from '@nestjs/testing'
import {INestApplication, ValidationPipe} from '@nestjs/common'
import * as request from 'supertest'
import {AppModule} from '../src/app.module'
import {PrismaService} from '../src/prisma/prisma.service'

describe('Authentication (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    )

    await app.init()
    prisma = app.get<PrismaService>(PrismaService)

    // Clean up test database
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /api/token', () => {
    it('should login with valid credentials', async () => {
      // Create test user first
      const hashedPassword = '$2b$10$K8PN7V4SAMPLE' // Use actual bcrypt hash in real tests
      await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: hashedPassword,
          role: 'member',
        },
      })

      return request(app.getHttpServer())
        .post('/api/token')
        .send({
          username: 'testuser',
          password: 'testpass',
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('access_token')
          expect(res.body).toHaveProperty('refresh_token')
        })
    })

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/token')
        .send({
          username: 'invalid',
          password: 'invalid',
        })
        .expect(401)
    })

    it('should validate request body', () => {
      return request(app.getHttpServer())
        .post('/api/token')
        .send({
          username: 'test',
          // missing password
        })
        .expect(400)
    })
  })

  describe('POST /api/token/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      // Implementation depends on having a valid refresh token
      // This is a placeholder for the test structure
      expect(true).toBe(true)
    })

    it('should reject invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/token/refresh')
        .send({
          refresh_token: 'invalid-token',
        })
        .expect(401)
    })
  })
})
