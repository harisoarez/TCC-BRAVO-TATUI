-- ================================================================
-- Script Seed para Testes do Instituto Bravo Tatuí
-- Executar no MySQL Workbench após executar o banco.sql
-- ================================================================
USE instituto_bravo;

-- 1. Usuários de Teste (Senhas criptografadas com bcrypt, 10 rounds)
-- admin123: $2a$10$CcrHzBQVRlUAQuH0dIrLkeffKyhfOd7hYWUQutzpbHuKn8t6sgU92
-- prof123:  $2a$10$7DnGfqSLwETZ6s0zGJpnL.drS0i/tcn62LjoK2IuMMnvUyixu2eLK
-- aluno123: $2a$10$65Syo6avD.8ynFanZD8HreQyR3/ywYBhs6LZOCvVAkBxydSR2Izdi

INSERT IGNORE INTO usuario_login 
(id_usuario, senha, tipo_usuario, email, nome, telefone, tipo_instrumento, primeiro_acesso, data_cadastro)
VALUES 
(1, '$2a$10$CcrHzBQVRlUAQuH0dIrLkeffKyhfOd7hYWUQutzpbHuKn8t6sgU92', 'admin', 'admin@institutobravo.com.br', 'Administrador Bravo', '15999990001', 'Direção', 0, NOW()),
(2, '$2a$10$7DnGfqSLwETZ6s0zGJpnL.drS0i/tcn62LjoK2IuMMnvUyixu2eLK', 'professor', 'professor@institutobravo.com.br', 'Carlos Eduardo (Professor)', '15999990002', 'Piano', 0, NOW()),
(3, '$2a$10$65Syo6avD.8ynFanZD8HreQyR3/ywYBhs6LZOCvVAkBxydSR2Izdi', 'aluno', 'aluno@institutobravo.com.br', 'Lucas Silva (Aluno)', '15999990003', 'Piano', 0, NOW());

-- 2. Tabela Professor
INSERT IGNORE INTO professor (idprofessor, CPF, CNPJ, usuario_login_id)
VALUES (1, '12345678901', '12345678000199', 2);

-- 3. Tabela Aluno
INSERT IGNORE INTO aluno (idaluno, CPF, endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_cep, data_nascimento, usuario_login_id)
VALUES (1, '98765432100', 'Rua das Flores', '123', 'Centro', 'Tatuí', '18270000', '2005-04-12', 3);

-- 4. Aulas de Exemplo no Calendário
INSERT INTO aula (idaula, titulo, instrumento, professor_idprofessor, sala, data_aula, duracao_minutos, status, observacoes)
VALUES 
(1, 'Iniciação ao Piano', 'Piano', 1, 1, DATE_ADD(NOW(), INTERVAL 2 HOUR), 60, 'normal', 'Módulo 1 - Postura e primeiras notas'),
(2, 'Prática de Escalas e Arpejos', 'Piano', 1, 2, DATE_ADD(NOW(), INTERVAL 1 DAY), 60, 'reposicao', 'Reposição da aula anterior'),
(3, 'Iniciação à Bateria', 'Bateria', 1, 3, DATE_ADD(NOW(), INTERVAL 2 DAY), 60, 'normal', 'Estudo de rítmica básica')
ON DUPLICATE KEY UPDATE titulo=VALUES(titulo);
