import prisma from "./src/config/prisma.js";

try {
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
  console.log("✅ Conexão com MySQL estabelecida e validada com sucesso!");
} catch (error) {
  console.error("❌ Erro na conexão:", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
