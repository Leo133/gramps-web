import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('People API (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    
    await app.init();

    // Login to get access token
    const response = await request(app.getHttpServer())
      .post('/api/token')
      .send({ username: 'owner', password: 'owner' });
    
    accessToken = response.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/people (GET)', () => {
    it('should return list of people', () => {
      return request(app.getHttpServer())
        .get('/api/people')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('grampsId');
          expect(res.body[0]).toHaveProperty('firstName');
          expect(res.body[0]).toHaveProperty('surname');
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get('/api/people')
        .expect(401);
    });

    it('should support pagination', () => {
      return request(app.getHttpServer())
        .get('/api/people?page=1&pagesize=1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeLessThanOrEqual(1);
          expect(res.headers).toHaveProperty('x-total-count');
        });
    });

    it('should support search by name', () => {
      return request(app.getHttpServer())
        .get('/api/people?q=John')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter by gramps_id', () => {
      return request(app.getHttpServer())
        .get('/api/people?gramps_id=I0001')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0].grampsId).toBe('I0001');
          }
        });
    });
  });

  describe('/api/people/:handle (GET)', () => {
    let personHandle: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .get('/api/people')
        .set('Authorization', `Bearer ${accessToken}`);
      
      personHandle = response.body[0].handle;
    });

    it('should return a specific person by handle', () => {
      return request(app.getHttpServer())
        .get(`/api/people/${personHandle}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('handle', personHandle);
          expect(res.body).toHaveProperty('grampsId');
        });
    });

    it('should return 404 for non-existent handle', () => {
      return request(app.getHttpServer())
        .get('/api/people/nonexistent')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });
});
