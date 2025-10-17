// Documentação: Script de uso único para criar o primeiro Admin (Versão Corrigida 2.0)

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// --- Definições do Admin ---
// IMPORTANTE: Use este TELEFONE e senha para logar
const adminTelefone = '(99) 99999-9999';
const adminEmail = 'admin@medishiftneo.com';
const adminSenhaPura = 'admin123';
const adminNome = 'Admin Master';
const DB_FILE = 'medishiftneo.db';
// ----------------------------

console.log('Iniciando script para criar o primeiro admin...');

const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) { return console.error('Erro ao conectar ao banco:', err.message); }
  console.log('Conectado ao banco de dados SQLite (conexão local).');

  bcrypt.hash(adminSenhaPura, 10, (err, hash) => {
    if (err) {
      console.error('Erro ao hashear a senha:', err.message);
      db.close();
      return;
    }
    console.log('Senha hasheada com sucesso.');

    // [MODIFICADO] Agora usa 'funcao' e insere o 'telefone' como login
    const sql = `
      INSERT INTO Colaborador 
      (nome, email, telefone, senha, funcao, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [adminNome, adminEmail, adminTelefone, hash, 'Admin', 'ativo'], function(err) {
      if (err) {
        if (err.errno === 19) { 
          console.warn('AVISO: O Admin (ou esse email/telefone) já existe no banco.');
        } else {
          console.error('Erro ao inserir admin no banco:', err.message);
        }
      } else {
        console.log(`SUCESSO: Colaborador "${adminNome}" (ID: ${this.lastID}) foi criado.`);
        console.log(`Use este TELEFONE para logar: ${adminTelefone}`);
        console.log(`Use esta senha para logar: ${adminSenhaPura}`);
      }

      // 5. Fechar a conexão local
      db.close((err) => {
        if (err) { console.error('Erro ao fechar o banco:', err.message); } 
        else { console.log('Conexão local com o banco fechada.'); }
      });
    });
  });
});