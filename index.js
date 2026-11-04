import "dotenv/config";
import app from "./server.js";
import prisma from "./src/config/prisma.js";

const PORT = Number(process.env.PORT) || 3000;

async function iniciarServidor() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Conexão com o banco de dados MySQL estabelecida com sucesso!");

    app.listen(PORT, () => {
      console.log(`🚀 TalentFlow rodando em: http://localhost:${PORT}`);
      console.log(`📊 Dashboard: http://localhost:${PORT}/`);
      console.log(`📚 Gestão de Treinamentos: http://localhost:${PORT}/treinamentos`);
      console.log(`🔌 API CRUD: http://localhost:${PORT}/api/treinamentos`);
    });
  } catch (error) {
    console.error("❌ Falha ao iniciar o servidor TalentFlow:", error.message);
    process.exit(1);
  }
}

iniciarServidor();
