-- Migração para bancos já existentes (CT-028: e-mail único por cliente).
-- Execute uma única vez no banco de desenvolvimento/produção.
-- O banco de testes é recriado automaticamente por test/globalSetup.js.

USE loja_motors;

ALTER TABLE clientes
    ADD COLUMN Email VARCHAR(100) NULL AFTER Complemento,
    ADD UNIQUE KEY uq_clientes_email (Email);
