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

## ✨ Funcionalidades Implementadas

1. **Dashboard (`/`)**
   - **Pulso dos treinamentos:** Gráfico circular (*Donut Chart*) calculado dinamicamente com as proporções reais entre treinamentos *Agendados* e *Realizados*, além da carga horária total acumulada.
   - **Agenda de treinamentos:** Lista os próximos treinamentos agendados exibindo data (`DD/MM`), carga horária (`Xh`) e link direto para os detalhes.
   - **Resumo do cronograma:** Destaca a próxima capacitação agendada, a seguinte no calendário e o último treinamento realizado.
   - **Pessoas · Instrutores Responsáveis:** Exibe automaticamente os instrutores extraídos dos treinamentos cadastrados no MySQL, com quantidade de cursos e horas ministradas, permitindo filtrar os treinamentos de cada instrutor com um clique.
   - **Quadro de Gestão:** Tabela integrada com atalhos para consultar, editar e excluir treinamentos.

2. **Gestão de Treinamentos (`/treinamentos`)**
   - Listagem completa dos treinamentos salvos no banco de dados.
   - Pesquisa por título, instrutor ou descrição.
   - Filtros por status (`Todos`, `Agendados`, `Realizados`) e ordenação (data mais próxima, data mais recente, título A–Z, maior carga horária).

3. **Consulta de Detalhes (`/treinamentos/:id`)**
   - Visualização individual com título, status (`Hoje`, `Agendado` ou `Realizado`), instrutor, data por extenso, carga horária, descrição completa e carimbos de criação/atualização.

4. **Cadastro, Edição e Exclusão (CRUD Completo)**
   - Painel lateral (*Modal*) para cadastrar novos treinamentos (`POST /api/treinamentos`) e editar registros existentes (`PUT /api/treinamentos/:id`).
   - Modal de confirmação antes de excluir qualquer registro (`DELETE /api/treinamentos/:id`).
   - Validação de dados consistente no cliente e no servidor (incluindo verificação de dias reais do calendário e tratamento de fuso horário local/UTC).
   - Alternância entre **Tema Claro (padrão)** e **Tema Escuro (opcional)** com persistência no navegador.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Finalidade no Projeto |
| :--- | :--- |
| **Node.js (ES Modules)** | Ambiente de execução JavaScript utilizando `import` e `export`. |
| **Express 5** | Servidor HTTP, roteamento de páginas e endpoints da API REST. |
| **Prisma ORM 7.10.1** | Mapeamento objeto-relacional e comunicação com o banco de dados. |
| **@prisma/adapter-mariadb** | Adaptador oficial do Prisma 7 para conexão com MySQL/MariaDB. |
| **MySQL** | Sistema gerenciador de banco de dados relacional (`talentflow`). |
| **EJS** | Template engine para renderização dinâmica das páginas HTML no servidor. |
| **HTML5 / CSS3 / JS** | Estrutura semântica, tema claro/escuro responsivo e integração via Fetch API. |

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
│   │   └── prisma.js                # Instância do PrismaClient (lê DATABASE_URL com fallback)
│   ├── generated/
│   │   └── prisma/                  # Cliente gerado localmente via npx prisma generate
│   ├── models/
│   │   └── Treinamento.js           # Camada Model: consultas, filtros e indicadores no MySQL
│   ├── controllers/
│   │   ├── treinamentoController.js # Camada Controller (API JSON CRUD e validações)
│   │   └── pageController.js        # Camada Controller (Renderização das views EJS)
│   ├── routes/
│   │   ├── treinamentoRoutes.js     # Rotas da API REST (/api/treinamentos)
│   │   └── pageRoutes.js            # Rotas das páginas HTML (/, /treinamentos, /treinamentos/:id)
│   ├── views/
│   │   ├── partials/
│   │   │   ├── header.ejs           # Cabeçalho HTML, tema claro/escuro e abertura de layout
│   │   │   ├── sidebar.ejs          # Barra de navegação superior em formato de pílula
│   │   │   └── footer.ejs           # Modais de CRUD, rodapé e carregamento de scripts
│   │   ├── dashboard.ejs            # Página inicial com gráfico proporcional, agenda e instrutores
│   │   ├── treinamentos.ejs         # Página de listagem, busca e filtros
│   │   └── treinamento-detalhe.ejs  # Página de detalhes de um treinamento
│   └── public/
│       ├── css/
│       │   ├── main.css             # Variáveis de tema (claro/escuro), reset e navegação
│       │   ├── components.css       # Cards, gráfico circular, tabelas, modais e botões
│       │   └── responsive.css       # Adaptação para celular, tablet e desktop
│       ├── js/
│       │   ├── app.js               # Alternância de tema, aba ativa e notificações Toast
│       │   └── treinamentos.js      # Integração Fetch API (POST, PUT, DELETE, GET) e validação
│       └── images/
│           └── logo.svg             # Ícone vetorial do TalentFlow
│
├── .env                             # Variáveis de ambiente locais (ignorado pelo Git)
├── .env.example                     # Modelo de configuração de variáveis de ambiente
├── .gitignore                       # Arquivos ignorados pelo Git
├── package.json                     # Dependências e scripts npm
├── prisma.config.ts                 # Configuração do Prisma 7 CLI
├── server.js                        # Configuração da aplicação Express, EJS e rotas
├── index.js                         # Ponto de entrada que valida o MySQL e inicia o servidor
└── README.md                        # Documentação do projeto
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
| `GET` | `/` | Renderiza o **Dashboard** com indicadores, agenda e instrutores. |
| `GET` | `/treinamentos` | Renderiza a **Gestão de Treinamentos** com pesquisa e filtros. |
| `GET` | `/treinamentos/:id` | Renderiza os **Detalhes do Treinamento** selecionado. |

---

## 🚀 Como Instalar e Executar o Projeto

### 1. Pré-requisitos
- **Node.js** instalado
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
Como a pasta `src/generated/prisma/` é ignorada pelo Git, gere o cliente localmente:
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
