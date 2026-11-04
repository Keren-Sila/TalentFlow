import "dotenv/config";
import app from "./server.js";
import prisma from "./src/config/prisma.js";

const PORT = Number(process.env.PORT) || 3000;
let servidorHttp = null;

async function iniciarServidor() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Conexão com o banco de dados MySQL estabelecida com sucesso!");

    servidorHttp = app.listen(PORT, () => {
      console.log(`🚀 TalentFlow rodando em: http://localhost:${PORT}`);
      console.log(`📊 Dashboard: http://localhost:${PORT}/`);
      console.log(`📚 Gestão de Treinamentos: http://localhost:${PORT}/treinamentos`);
      console.log(`🔌 API CRUD: http://localhost:${PORT}/api/treinamentos`);
    });

    servidorHttp.on("error", async (erro) => {
      if (erro.code === "EADDRINUSE") {
        console.error(`❌ A porta ${PORT} já está em uso por outro processo.`);
      } else {
        console.error("❌ Erro no servidor HTTP:", erro.message);
      }
      await prisma.$disconnect().catch(() => {});
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Falha ao iniciar o servidor TalentFlow:", error.message);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

async function encerrarServidor(sinal) {
  console.log(`\n🛑 Sinal ${sinal} recebido. Encerrando o TalentFlow com segurança...`);
  try {
    if (servidorHttp) {
      await new Promise((resolve) => servidorHttp.close(resolve));
    }
    await prisma.$disconnect();
    console.log("✅ Conexão com o MySQL encerrada.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao encerrar o servidor:", error.message);
    process.exit(1);
  }
}

process.on("SIGINT", () => encerrarServidor("SIGINT"));
process.on("SIGTERM", () => encerrarServidor("SIGTERM"));

iniciarServidor();
