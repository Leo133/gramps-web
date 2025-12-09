import {PrismaClient} from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Hash password for owner user
  const hashedPassword = await bcrypt.hash('owner', 10)

  // Create owner user
  const owner = await prisma.user.upsert({
    where: {username: 'owner'},
    update: {},
    create: {
      username: 'owner',
      email: 'owner@example.com',
      password: hashedPassword,
      fullName: 'Owner User',
      role: 'owner',
      emailVerified: true,
      enabled: true,
    },
  })

  console.log('Created owner user:', owner.username)

  // Create sample people
  const john = await prisma.person.upsert({
    where: {handle: 'p0001'},
    update: {},
    create: {
      handle: 'p0001',
      grampsId: 'I0001',
      gender: 1,
      private: false,
      firstName: 'John',
      surname: 'Doe',
      callName: 'John',
      birthDate: '1980-01-01',
      birthPlace: 'New York',
      primaryName: JSON.stringify({
        first_name: 'John',
        surname_list: [{surname: 'Doe'}],
        call: 'John',
      }),
      profile: JSON.stringify({
        name_surname: 'Doe',
        name_given: 'John',
        birth: {
          date: '1980-01-01',
          place_name: 'New York',
        },
        death: {},
      }),
      mediaList: JSON.stringify([]),
      eventRefList: JSON.stringify([]),
    },
  })

  const jane = await prisma.person.upsert({
    where: {handle: 'p0002'},
    update: {},
    create: {
      handle: 'p0002',
      grampsId: 'I0002',
      gender: 0,
      private: false,
      firstName: 'Jane',
      surname: 'Smith',
      callName: 'Jane',
      birthDate: '1982-05-15',
      birthPlace: 'London',
      primaryName: JSON.stringify({
        first_name: 'Jane',
        surname_list: [{surname: 'Smith'}],
        call: 'Jane',
      }),
      profile: JSON.stringify({
        name_surname: 'Smith',
        name_given: 'Jane',
        birth: {
          date: '1982-05-15',
          place_name: 'London',
        },
        death: {},
      }),
      mediaList: JSON.stringify([]),
      eventRefList: JSON.stringify([]),
    },
  })

  console.log('Created sample people:', john.grampsId, jane.grampsId)

  // Create sample family
  const family = await prisma.family.upsert({
    where: {handle: 'f0001'},
    update: {},
    create: {
      handle: 'f0001',
      grampsId: 'F0001',
      fatherHandle: 'p0001',
      motherHandle: 'p0002',
      type: 1,
      childRefList: JSON.stringify([]),
      eventRefList: JSON.stringify([]),
    },
  })

  console.log('Created sample family:', family.grampsId)

  // Create metadata
  await prisma.metadata.upsert({
    where: {key: 'version'},
    update: {},
    create: {
      key: 'version',
      value: JSON.stringify('1.0.0'),
    },
  })

  await prisma.metadata.upsert({
    where: {key: 'title'},
    update: {},
    create: {
      key: 'title',
      value: JSON.stringify('Gramps Web'),
    },
  })

  await prisma.metadata.upsert({
    where: {key: 'allow_registration'},
    update: {},
    create: {
      key: 'allow_registration',
      value: JSON.stringify(true),
    },
  })

  await prisma.metadata.upsert({
    where: {key: 'server'},
    update: {},
    create: {
      key: 'server',
      value: JSON.stringify({chat: true}),
    },
  })

  await prisma.metadata.upsert({
    where: {key: 'gramps_webapi'},
    update: {},
    create: {
      key: 'gramps_webapi',
      value: JSON.stringify({version: '3.3.0'}),
    },
  })

  await prisma.metadata.upsert({
    where: {key: 'database'},
    update: {},
    create: {
      key: 'database',
      value: JSON.stringify({
        actual_schema: '1',
        schema: '1.0',
      }),
    },
  })

  await prisma.metadata.upsert({
    where: {key: 'locale'},
    update: {},
    create: {
      key: 'locale',
      value: JSON.stringify({language: 'en'}),
    },
  })

  console.log('Created metadata')

  // Create tree settings
  await prisma.treeSettings.upsert({
    where: {key: 'min_role_ai'},
    update: {},
    create: {
      key: 'min_role_ai',
      value: JSON.stringify(0),
    },
  })

  console.log('Created tree settings')

  console.log('Database seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
