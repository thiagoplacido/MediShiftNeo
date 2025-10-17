// Documentação: Este arquivo centraliza a conexão com o banco de dados SQLite.

const sqlite3 = require('sqlite3').verbose();
const DB_FILE = 'medishiftneo.db';

// Conecta ao banco de dados
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    // Não precisamos criar tabelas aqui,
    // o 'database.js' que rodamos antes já fez isso.
    console.log('Conectado ao banco de dados SQLite (a partir do db.js).');
  }
});

// "Exporta" a variável 'db' para que outros arquivos possam importá-la
module.exports = db;