# Instituto Musical Bravo Tatuí (TCC)

Sistema de Gestão Acadêmica, Controle Operacional e Portal Institucional da Escola de Música Bravo Tatuí.

---

## 🚀 Como Executar o Projeto Localmente

### 1. Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **MySQL** rodando localmente (via **XAMPP**, **WampServer** ou **MySQL Workbench** na porta padrão `3306`)

---

### 2. Passo a Passo Rápido

1. **Clone o repositório:**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd TCC-BRAVO-TATUI
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   npm run install:backend
   ```

3. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

> 💡 **Nota Importante sobre o Banco de Dados:**
> Ao iniciar o servidor com `npm run dev`, o sistema **cria automaticamente** o banco de dados `instituto_bravo`, gera todas as tabelas necessárias e popula as contas e dados iniciais de teste caso estejam vazios. Não é necessário importar scripts SQL manualmente!

---

### 3. Contas de Acesso Inicial (Seed)

| Nível / Cargo | E-mail de Login | Senha |
| :--- | :--- | :--- |
| **Proprietário (Owner)** | `owner@institutobravo.com.br` | `D@hl1a_P1nn@t4!` |
| **Administrador** | `admin@institutobravo.com.br` | `admin123` |
| **Professor** | `professor@institutobravo.com.br` | `prof123` |
| **Aluno** | `aluno@institutobravo.com.br` | `aluno123` |

---

### 4. Estrutura das Páginas

- **Página Inicial:** `http://localhost:3000/site/index.html`
- **Instituto Musical Bravo (Cursos):** `http://localhost:3000/site/instrumentos.html`
- **Orquestra Bravo Tatuí:** `http://localhost:3000/site/orquestra.html`
- **Coffee Bravo (Cardápio):** `http://localhost:3000/site/cardapio.html`
- **Formações e Eventos:** `http://localhost:3000/site/formacoes.html`
- **Calendário de Aulas:** `http://localhost:3000/site/calendario.html`
- **Painel Administrativo:** `http://localhost:3000/paginas/dashboard`
