import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.ts";

/**
 * Extrai os parâmetros de conexão prioritariamente de DATABASE_URL
 * para garantir que o Prisma CLI e a aplicação acessem sempre o mesmo banco,
 * mantendo fallback para as variáveis separadas (DATABASE_HOST, etc.).
 */
function obterConfiguracaoBanco() {
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      return {
        host: url.hostname || process.env.DATABASE_HOST || "localhost",
        port: Number(url.port || process.env.DATABASE_PORT || 3306),
        user: decodeURIComponent(url.username || process.env.DATABASE_USER || "root"),
        password: decodeURIComponent(url.password || process.env.DATABASE_PASS || ""),
        database: url.pathname.replace(/^\//, "") || process.env.DATABASE_DB || "talentflow",
        connectionLimit: 5,
      };
    } catch {
      // Fallback para variáveis individuais caso DATABASE_URL não seja uma URL válida
    }
  }

  return {
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASS || "",
    database: process.env.DATABASE_DB || "talentflow",
    connectionLimit: 5,
  };
}

const adapter = new PrismaMariaDb(obterConfiguracaoBanco());
const prisma = new PrismaClient({ adapter });

export default prisma;
