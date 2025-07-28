import { PrismaClient, Role } from '../src/generated/prisma/index.js';

const prisma = new PrismaClient();

function generateUserId() {
  const min = 1000000000;
  const max = 9999999999;
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function main() {
  const adminEmail = 'changeme@changeme.com';

  const existingAdmin = await prisma.user.findFirst({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const newUserId = generateUserId();

    await prisma.user.create({
      data: {
        userId: BigInt(newUserId),
        email: adminEmail,
        name: 'Admin',
        role: Role.ADMIN,
      },
    });

    console.log(`Admin user created with userId ${newUserId}`);
  } else {
    console.log('Admin user already exists with id: ', existingAdmin.userId);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
