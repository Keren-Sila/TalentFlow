# 🎓 TalentFlow — Sistema de Gestão de Treinamentos

![Node.js](https://img.shields.io/badge/Node.js-ES_Modules-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_ORM-7.10.1-2D3748?style=flat-square&logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=flat-square&logo=mysql&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-Templates-B4CA65?style=flat-square)
![MVC](https://img.shields.io/badge/Arquitetura-MVC-6366F1?style=flat-square)

O **TalentFlow** é um sistema web corporativo desenvolvido para o setor de **Recursos Humanos (RH)** gerenciar o ciclo completo de treinamentos e capacitações de uma empresa em um único lugar.

> **Projeto Final — Curso Senac**  
> Arquitetura MVC com Node.js, Express, Prisma ORM 7.10.1, MySQL e EJS.

---

## ✨ Funcionalidades Principais

1. **Dashboard Executivo (`/`)**
   - Indicadores em tempo real: Quantidade de treinamentos cadastrados, Total de horas de treinamento, Treinamentos próximos (agendados) e Treinamentos realizados.
   - Listas rápidas dos próximos treinamentos programados e do histórico recente.
   - Quadro geral com atalhos para consulta, edição e exclusão.

2. **Gestão de Treinamentos (`/treinamentos`)**
   - Listagem completa dos treinamentos cadastrados.
   - Pesquisa por título, instrutor ou descrição.
   - Filtros por status (`Todos`, `Próximos/Agendados`, `Realizados/Concluídos`) e ordenação dinâmica (data, título A–Z, maior carga horária).

3. **Consulta de Detalhes (`/treinamentos/:id`)**
   - Visualização detalhada de um treinamento específico, incluindo status, instrutor, data por extenso, carga horária, conteúdo programático e carimbos de criação/atualização.

4. **Cadastro, Edição e Exclusão (CRUD Completo)**
   - Painel lateral (Slide-over Modal) para cadastrar novos treinamentos e editar registros existentes.
   - Modal de confirmação segura antes de excluir qualquer registro.
   - Notificações visuais (*Toast*) de sucesso e erro e validação de dados no cliente e no servidor.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Finalidade no Projeto |
| :--- | :--- |
| **Node.js (ES Modules)** | Ambiente de execução JavaScript utilizando `import` e `export`. |
| **Express 5** | Servidor HTTP, roteamento de páginas e endpoints da API REST. |
| **Prisma ORM 7.10.1** | Mapeamento objeto-relacional e comunicação segura com o banco de dados. |
| **@prisma/adapter-mariadb** | Adaptador oficial do Prisma 7 para conexão com MySQL/MariaDB. |
| **MySQL** | Sistema gerenciador de banco de dados relacional (`talentflow`). |
| **EJS** | Template engine para renderização dinâmica das páginas HTML no servidor. |
| **HTML5 / CSS3 / JS** | Estrutura semântica, identidade visual responsiva (Azul-marinho + Roxo) e interatividade. |

---

## 📂 Estrutura do Projeto (Arquitetura MVC)

```text
TalentFlow/
│
├── prisma/
│   ├── migrations/                  # Histórico de migrações SQL do banco
│   └── schema.prisma                # Definição do modelo Treinamento e gerador Prisma
│
├── src/
│   ├── config/
│   │   └── prisma.js                # Instância do PrismaClient com PrismaMariaDb adapter
│   ├── generated/
│   │   └── prisma/                  # Cliente gerado pelo Prisma 7
│   ├── models/
│   │   └── Treinamento.js           # Camada Model: consultas e operações via Prisma
│   ├── controllers/
│   │   ├── treinamentoController.js # Camada Controller (API JSON CRUD e validações)
│   │   └── pageController.js        # Camada Controller (Renderização das views EJS)
│   ├── routes/
│   │   ├── treinamentoRoutes.js     # Rotas da API REST (/api/treinamentos)
│   │   └── pageRoutes.js            # Rotas das páginas HTML (/, /treinamentos, /treinamentos/:id)
│   ├── views/
│   │   ├── partials/
│   │   │   ├── header.ejs           # Cabeçalho, topbar e abertura de layout
│   │   │   ├── sidebar.ejs          # Menu de navegação lateral
│   │   │   └── footer.ejs           # Modais de CRUD, rodapé e scripts
│   │   ├── dashboard.ejs            # Página inicial com KPIs e resumos
│   │   ├── treinamentos.ejs         # Página de listagem, busca e filtros
│   │   └── treinamento-detalhe.ejs  # Página de detalhes de um treinamento
│   └── public/
│       ├── css/
│       │   ├── main.css             # Variáveis, reset e estrutura principal
│       │   ├── components.css       # Cards, tabelas, modais, botões e badges
│       │   └── responsive.css       # Adaptação para mobile, tablet e desktop
│       ├── js/
│       │   ├── app.js               # Menu mobile e sistema de notificações Toast
│       │   └── treinamentos.js      # Integração Fetch API (POST, PUT, DELETE, GET)
│       └── images/
│           └── logo.svg             # Ícone institucional do TalentFlow
│
├── .env                             # Variáveis de ambiente locais (não versionado)
├── .env.example                     # Exemplo de configuração de variáveis de ambiente
├── .gitignore                       # Arquivos ignorados pelo Git
├── package.json                     # Dependências e scripts npm
├── prisma.config.ts                 # Configuração do Prisma 7
├── server.js                        # Configuração da aplicação Express, EJS e rotas
├── index.js                         # Ponto de entrada que conecta ao MySQL e inicia o servidor
└── README.md                        # Documentação completa do projeto
```

---

## 🔌 Rotas do Sistema

### Rotas da API REST (Respostas JSON)

| Método | Rota | Descrição |
| :---: | :--- | :--- |
| `GET` | `/api/treinamentos` | Lista todos os treinamentos (aceita `?busca=`, `?status=`, `?ordenar=`). |
| `GET` | `/api/treinamentos/:id` | Consulta um treinamento específico pelo `id`. |
| `POST` | `/api/treinamentos` | Cadastra um novo treinamento no banco de dados. |
| `PUT` | `/api/treinamentos/:id` | Atualiza os dados de um treinamento existente. |
| `DELETE` | `/api/treinamentos/:id` | Exclui um treinamento pelo `id`. |

### Rotas de Interface Web (Respostas HTML via EJS)

| Método | Rota | Descrição |
| :---: | :--- | :--- |
| `GET` | `/` | Renderiza o **Dashboard** com indicadores e próximos treinamentos. |
| `GET` | `/treinamentos` | Renderiza a **Gestão de Treinamentos** com pesquisa e filtros. |
| `GET` | `/treinamentos/:id` | Renderiza os **Detalhes do Treinamento** selecionado. |

---

## 🚀 Como Instalar e Executar o Projeto

### 1. Pré-requisitos
- **Node.js** instalado (v20.19+ ou superior)
- **MySQL Server** em execução

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Copie o arquivo `.env.example` para `.env` e ajuste as credenciais do seu MySQL:
```env
DATABASE_URL="mysql://root:sua_senha@localhost:3306/talentflow"

DATABASE_HOST="localhost"
DATABASE_PORT="3306"
DATABASE_USER="root"
DATABASE_PASS="sua_senha"
DATABASE_DB="talentflow"
PORT=3000
```

### 4. Executar as migrações e gerar o Prisma Client
```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Iniciar o servidor
```bash
# Modo padrão
npm start

# Modo de desenvolvimento (com reinicialização automática)
npm run dev
```
Acesse no navegador: **`http://localhost:3000`**

---

## 🎤 Roteiro de Apresentação ao Professor

1. **Contextualização (1 min):**
   - Apresentar o **TalentFlow** como uma solução focada em RH para controle centralizado de capacitações corporativas (Dashboard + Catálogo + CRUD).
2. **Arquitetura MVC e Fluxo dos Dados (2 min):**
   - Mostrar a separação clara na pasta `src/`:
     - **Routes (`treinamentoRoutes.js` / `pageRoutes.js`):** recebem a requisição HTTP.
     - **Controllers (`treinamentoController.js` / `pageController.js`):** validam os campos obrigatórios (`titulo`, `instrutor`, `data`, `cargaHoraria`) e coordenam a resposta em **JSON** ou **HTML (EJS)**.
     - **Model (`Treinamento.js`) + Prisma (`config/prisma.js`):** executam as queries no **MySQL** (`findMany`, `findUnique`, `create`, `update`, `delete`).
3. **Demonstração Prática do CRUD (2 min):**
   - Abrir o **Dashboard (`/`)** e mostrar os 4 indicadores calculados dinamicamente.
   - Clicar em **Novo Treinamento**, preencher o formulário e demonstrar o `POST /api/treinamentos` salvando no MySQL e atualizando os indicadores.
   - Ir em **Treinamentos (`/treinamentos`)**, pesquisar pelo título e filtrar entre *Agendados* e *Realizados*.
   - Abrir os **Detalhes (`/treinamentos/:id`)**, clicar em **Editar** (`PUT /api/treinamentos/:id`) e depois demonstrar a **Exclusão com confirmação** (`DELETE /api/treinamentos/:id`).
