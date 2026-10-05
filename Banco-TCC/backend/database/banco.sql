CREATE DATABASE IF NOT EXISTS instituto_bravo;
USE instituto_bravo;

-- Tabela de login e dados básicos dos usuários (sem dependência de Firebase)
CREATE TABLE IF NOT EXISTS usuario_login (
  id_usuario INT PRIMARY KEY AUTO_INCREMENT,
  senha VARCHAR(255) NOT NULL,
  tipo_usuario ENUM('owner', 'admin', 'normal', 'aluno', 'professor') NOT NULL DEFAULT 'normal',
  email VARCHAR(85) UNIQUE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  telefone VARCHAR(20),
  cpf VARCHAR(14),
  tipo_instrumento VARCHAR(45),
  autorizacao_imagem TINYINT DEFAULT 0,
  foto_url VARCHAR(255),
  descricao TEXT,
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso TIMESTAMP NULL,
  primeiro_acesso TINYINT DEFAULT 1
);

-- Tabela de cursos e valores de mensalidade
CREATE TABLE IF NOT EXISTS curso_mensalidade (
  idcurso INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  valor_mensalidade DECIMAL(10,2) NOT NULL DEFAULT 180.00,
  ativo TINYINT(1) DEFAULT 1
);

-- Tabela de alunos
CREATE TABLE IF NOT EXISTS aluno (
  idaluno INT PRIMARY KEY AUTO_INCREMENT,
  CPF VARCHAR(14) UNIQUE,
  curso VARCHAR(100) DEFAULT 'Piano',
  desconto_porcentagem DECIMAL(5,2) DEFAULT 0.00,
  endereco_rua VARCHAR(100),
  endereco_numero VARCHAR(10),
  endereco_bairro VARCHAR(60),
  endereco_cidade VARCHAR(60),
  endereco_cep VARCHAR(10),
  data_nascimento DATE NOT NULL,
  usuario_login_id INT NOT NULL UNIQUE,
  FOREIGN KEY (usuario_login_id) 
    REFERENCES usuario_login(id_usuario)
    ON DELETE CASCADE
);

-- Tabela de professores
CREATE TABLE IF NOT EXISTS professor (
  idprofessor INT PRIMARY KEY AUTO_INCREMENT,
  CNPJ VARCHAR(18) UNIQUE,
  CPF VARCHAR(14) UNIQUE,
  usuario_login_id INT NOT NULL UNIQUE,
  FOREIGN KEY (usuario_login_id) 
    REFERENCES usuario_login(id_usuario)
    ON DELETE CASCADE
);

-- Tabela de responsáveis legais para alunos menores de idade
CREATE TABLE IF NOT EXISTS responsavel_legal (
  idResponsavel INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  email VARCHAR(85) NOT NULL
);

-- Vínculo entre aluno e responsável legal
CREATE TABLE IF NOT EXISTS aluno_responsavel (
  aluno_idaluno INT NOT NULL,
  responsavel_legal_idResponsavel INT NOT NULL,
  parentesco VARCHAR(45) NOT NULL,
  responsavel_principal TINYINT DEFAULT 0,
  PRIMARY KEY (aluno_idaluno, responsavel_legal_idResponsavel),
  FOREIGN KEY (aluno_idaluno) 
    REFERENCES aluno(idaluno)
    ON DELETE CASCADE,
  FOREIGN KEY (responsavel_legal_idResponsavel) 
    REFERENCES responsavel_legal(idResponsavel)
    ON DELETE CASCADE
);

-- Tabela de agendamento de aulas
CREATE TABLE IF NOT EXISTS aula (
  idaula INT PRIMARY KEY AUTO_INCREMENT,
  titulo VARCHAR(100) NOT NULL,
  instrumento VARCHAR(45) NOT NULL,
  professor_idprofessor INT NOT NULL,
  aluno_idaluno INT NULL,
  sala INT NOT NULL,
  data_aula DATETIME NOT NULL,
  duracao_minutos INT DEFAULT 60,
  status ENUM('normal', 'reposicao', 'cancelada') DEFAULT 'normal',
  observacoes TEXT,
  FOREIGN KEY (professor_idprofessor) 
    REFERENCES professor(idprofessor)
    ON DELETE CASCADE,
  FOREIGN KEY (aluno_idaluno) 
    REFERENCES aluno(idaluno)
    ON DELETE SET NULL
);

-- Tabela de contas a receber (mensalidades / matrículas)
CREATE TABLE IF NOT EXISTS financeiro_recebimento (
  idfinanceiroRecebimento INT PRIMARY KEY AUTO_INCREMENT,
  data_vencimento DATE NOT NULL,
  data_pagamento DATETIME NULL,
  valor DECIMAL(10,2) NOT NULL,
  status_parcela ENUM('pendente', 'em_analise', 'pago', 'atrasado') DEFAULT 'pendente',
  forma_pagamento ENUM('pix', 'cartao', 'boleto', 'dinheiro') NULL,
  comprovante_url VARCHAR(255) NULL,
  mes_referencia VARCHAR(20) NULL,
  aluno_idaluno INT NOT NULL,
  FOREIGN KEY (aluno_idaluno) 
    REFERENCES aluno(idaluno)
    ON DELETE CASCADE
);

-- Tabela de contas a pagar (remuneração docente / despesas)
CREATE TABLE IF NOT EXISTS financeiro_pagamento (
  idfinanceiroPagamento INT PRIMARY KEY AUTO_INCREMENT,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE NULL,
  valor DECIMAL(10,2) NOT NULL,
  status_parcela ENUM('pendente', 'pago', 'atrasado') DEFAULT 'pendente',
  forma_pagamento ENUM('pix', 'cartao', 'boleto', 'dinheiro') NULL,
  professor_idprofessor INT NOT NULL,
  FOREIGN KEY (professor_idprofessor) 
    REFERENCES professor(idprofessor)
    ON DELETE CASCADE
);