import "dotenv/config";
import app from "./server.js";
import prisma from "./src/config/prisma.js";

const PORT = Number(process.env.PORT) || 3000;

async function iniciarServidor() {
  try {
    await prisma.$connect();
    console.log("✅ Conexão com o banco de dados MySQL estabelecida com sucesso!");

    app.listen(PORT, () => {
      console.log(`🚀 TalentFlow rodando em: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar o servidor TalentFlow:", error.message);
    process.exit(1);
  }
}

iniciarServidor();
