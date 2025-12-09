import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('owner', 10);
  const user = await prisma.user.upsert({
    where: { username: 'owner' },
    update: {},
    create: {
      username: 'owner',
      email: 'owner@example.com',
      password: hashedPassword,
      fullName: 'Owner User',
      role: 'OWNER',
      enabled: true,
      emailVerified: true,
    },
  });

  console.log('Created user:', user.username);

  // Create sample people
  const person1 = await prisma.person.upsert({
    where: { handle: 'p0001' },
    update: {},
    create: {
      handle: 'p0001',
      grampsId: 'I0001',
      gender: 1,
      firstName: 'John',
      surname: 'Doe',
      callName: 'John',
      birthDate: '1980-01-01',
      birthPlace: 'New York',
    },
  });

  const person2 = await prisma.person.upsert({
    where: { handle: 'p0002' },
    update: {},
    create: {
      handle: 'p0002',
      grampsId: 'I0002',
      gender: 0,
      firstName: 'Jane',
      surname: 'Smith',
      callName: 'Jane',
      birthDate: '1982-05-15',
      birthPlace: 'London',
    },
  });

  console.log('Created people:', person1.grampsId, person2.grampsId);

  // Create a family
  const family = await prisma.family.upsert({
    where: { handle: 'f0001' },
    update: {},
    create: {
      handle: 'f0001',
      grampsId: 'F0001',
      fatherHandle: 'p0001',
      motherHandle: 'p0002',
      familyType: 1,
    },
  });

  console.log('Created family:', family.grampsId);

  // Create tree settings
  await prisma.treeSettings.upsert({
    where: { key: 'min_role_ai' },
    update: { value: '0' },
    create: {
      key: 'min_role_ai',
      value: '0',
    },
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
