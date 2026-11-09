import "dotenv/config";
import app from "./server.js";
import prisma from "./src/config/prisma.js";

const PORT = Number(process.env.PORT) || 3000;

async function iniciarServidor() {
  try {
    await prisma.$connect();
    console.log("✅ Conexão com o banco de dados MySQL estabelecida com sucesso!");

    const servidor = app.listen(PORT, () => {
      console.log(`🚀 TalentFlow rodando em: http://localhost:${PORT}`);
    });

    const encerrarAplicacao = async (sinal) => {
      console.log(`\n🛑 Sinal ${sinal} recebido. Encerrando o TalentFlow com segurança...`);
      await new Promise((resolve) => servidor.close(resolve));
      await prisma.$disconnect();
      process.exit(0);
    };

    process.once("SIGINT", () => encerrarAplicacao("SIGINT"));
    process.once("SIGTERM", () => encerrarAplicacao("SIGTERM"));
  } catch (error) {
    console.error("❌ Erro ao iniciar o servidor TalentFlow:", error.message);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

iniciarServidor();
