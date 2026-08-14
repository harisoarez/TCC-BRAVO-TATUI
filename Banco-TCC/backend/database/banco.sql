CREATE DATABASE IF NOT EXISTS instituto_bravo;
USE instituto_bravo;

CREATE TABLE usuario_login (
  id_usuario INT PRIMARY KEY AUTO_INCREMENT,
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  tipo_usuario ENUM('professor', 'aluno') NOT NULL,
  email VARCHAR(85) UNIQUE NOT NULL,
  nome VARCHAR(45),
  telefone VARCHAR(11),
  tipo_instrumento VARCHAR(45),
  autorizacao_imagem TINYINT DEFAULT 0,
  foto_url VARCHAR(255),
  data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_acesso TIMESTAMP
);

CREATE TABLE aluno (
  idaluno INT PRIMARY KEY AUTO_INCREMENT,
  CPF VARCHAR(11),
  endereco_rua VARCHAR(80),
  endereco_numero VARCHAR(45),
  endereco_bairro VARCHAR(45),
  endereco_cidade VARCHAR(45),
  endereco_cep VARCHAR(45),
  data_nascimento DATE,
  usuario_login_id INT,
  FOREIGN KEY (usuario_login_id) 
    REFERENCES usuario_login(id_usuario)
);

CREATE TABLE professor (
  idprofessor INT PRIMARY KEY AUTO_INCREMENT,
  CNPJ VARCHAR(14),
  CPF VARCHAR(11),
  usuario_login_id INT,
  FOREIGN KEY (usuario_login_id) 
    REFERENCES usuario_login(id_usuario)
);

CREATE TABLE responsavel_legal (
  idResponsavel INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(45),
  telefone VARCHAR(11),
  email VARCHAR(85)
);

CREATE TABLE aluno_responsavel (
  aluno_idaluno INT,
  responsavel_legal_idResponsavel INT,
  parentesco VARCHAR(45),
  responsavel_principal TINYINT,
  PRIMARY KEY (aluno_idaluno, responsavel_legal_idResponsavel),
  FOREIGN KEY (aluno_idaluno) 
    REFERENCES aluno(idaluno),
  FOREIGN KEY (responsavel_legal_idResponsavel) 
    REFERENCES responsavel_legal(idResponsavel)
);

CREATE TABLE aula (
  idaula INT PRIMARY KEY AUTO_INCREMENT,
  professor_idprofessor INT,
  aluno_idaluno INT,
  sala INT,
  data_aula DATETIME,
  status ENUM('agendada','realizada','cancelada') DEFAULT 'agendada',
  duracao_minutos INT DEFAULT 60,
  FOREIGN KEY (professor_idprofessor) 
    REFERENCES professor(idprofessor),
  FOREIGN KEY (aluno_idaluno) 
    REFERENCES aluno(idaluno)
);

CREATE TABLE financeiro_recebimento (
  idfinanceiroRecebimento INT PRIMARY KEY AUTO_INCREMENT,
  data_vencimento DATE,
  data_pagamento DATETIME,
  valor DECIMAL(10,2),
  status_parcela ENUM('pendente','pago','atrasado'),
  forma_pagamento ENUM('pix','cartao','boleto','dinheiro'),
  aluno_idaluno INT,
  FOREIGN KEY (aluno_idaluno) 
    REFERENCES aluno(idaluno)
);

CREATE TABLE financeiro_pagamento (
  idfinanceiroPagamento INT PRIMARY KEY AUTO_INCREMENT,
  data_vencimento DATE,
  data_pagamento DATE,
  valor DECIMAL(10,2),
  status_parcela ENUM('pendente','pago','atrasado'),
  forma_pagamento ENUM('pix','cartao','boleto','dinheiro'),
  professor_idprofessor INT,
  FOREIGN KEY (professor_idprofessor) 
    REFERENCES professor(idprofessor)
);