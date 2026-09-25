CREATE DATABASE IF NOT EXISTS instituto_bravo;
USE instituto_bravo;

CREATE TABLE usuario_login (
  id_usuario INT PRIMARY KEY AUTO_INCREMENT,
  senha VARCHAR(255),
  tipo_usuario ENUM('professor', 'aluno', 'admin') NOT NULL,
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
  CPF VARCHAR(11) UNIQUE,
  endereco_rua VARCHAR(80),
  endereco_numero VARCHAR(5),
  endereco_bairro VARCHAR(45),
  endereco_cidade VARCHAR(45),
  endereco_cep VARCHAR(45),
  data_nascimento DATE,
  usuario_login_id INT NOT NULL UNIQUE,
  FOREIGN KEY (usuario_login_id) 
    REFERENCES usuario_login(id_usuario)
);

CREATE TABLE professor (
  idprofessor INT PRIMARY KEY AUTO_INCREMENT,
  CNPJ VARCHAR(14) UNIQUE,
  CPF VARCHAR(11) UNIQUE,
  usuario_login_id INT NOT NULL,
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
  aluno_idaluno INT NOT NULL,
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
  professor_idprofessor INT NOT NULL,
  aluno_idaluno INT NOT NULL,
  sala INT,
  data_aula DATETIME NOT NULL,
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
  valor DECIMAL(10,2) NOT NULL,
  status_parcela ENUM('pendente','pago','atrasado'),
  forma_pagamento ENUM('pix','cartao','boleto','dinheiro'),
  aluno_idaluno INT NOT NULL,
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
  professor_idprofessor INT NOT NULL,
  FOREIGN KEY (professor_idprofessor) 
    REFERENCES professor(idprofessor)
);