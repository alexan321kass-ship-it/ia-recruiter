const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cvs = await prisma.cv.findMany();
  console.log('CVS IN DB:', cvs.length);
  if (cvs.length > 0) {
    console.log('LATEST CV:', JSON.stringify(cvs[cvs.length-1], null, 2));
  }
}

main().finally(() => prisma.$disconnect());
