// Documentação: Configuração do banco de dados SQLite.
// [MODIFICADO] Refatoração 2.0 (Função, Coordenador, Foto, Plantão, Unidade)

const sqlite3 = require('sqlite3').verbose();
const DB_FILE = 'medishiftneo.db';

const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
    db.serialize(() => {
      createTableColaborador();
      createTableUnidade(); // [NOVO] Tabela de Unidades
      createTableShift();
      createTableResidente();
      createTableAuditoria();
    });
    db.close((err) => {
      if (err) { console.error('Erro ao fechar o banco de dados:', err.message); } 
      else { console.log('Conexão com o banco de dados fechada após setup.'); }
    });
  }
});

// 1. Tabela Colaborador
function createTableColaborador() {
  const sql = `
    CREATE TABLE IF NOT EXISTS Colaborador (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULl,
      email TEXT UNIQUE,
      telefone TEXT UNIQUE,
      senha TEXT NOT NULL,
      funcao TEXT NOT NULL CHECK(funcao IN ('Admin', 'Coordenador', 'Operador')),
      status TEXT NOT NULL DEFAULT 'ativo',
      lingua TEXT DEFAULT 'pt-br',
      fuso TEXT DEFAULT 'America/Sao_Paulo',
      foto TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.run(sql, (err) => {
    if (err) { console.error('Erro ao criar tabela Colaborador:', err.message); } 
    else { console.log('Tabela "Colaborador" (Refatorada) verificada/criada com sucesso.'); }
  });
}

// 2. [NOVO] Tabela Unidade (para o menu suspenso)
function createTableUnidade() {
  const sql = `
    CREATE TABLE IF NOT EXISTS Unidade (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE
    );
  `;
  db.run(sql, (err) => {
    if (err) { console.error('Erro ao criar tabela Unidade:', err.message); } 
    else { console.log('Tabela "Unidade" verificada/criada com sucesso.'); }
  });
}

// 3. Tabela Shift (Plantão)
function createTableShift() {
  const sql = `
    CREATE TABLE IF NOT EXISTS Shift (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unidadeId INTEGER NOT NULL,
      dataPlantao DATE NOT NULL,
      turno TEXT NOT NULL CHECK(turno IN ('Dia', 'Noite')),
      status TEXT NOT NULL CHECK(status IN ('ABERTO', 'REVISAO', 'FECHADO')) DEFAULT 'ABERTO',
      participantes TEXT, 
      coResponsaveis TEXT,
      notasAdmin TEXT,
      referenciaId INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (unidadeId) REFERENCES Unidade(id),
      FOREIGN KEY (referenciaId) REFERENCES Colaborador(id)
    );
  `;
  db.run(sql, (err) => {
    if (err) { console.error('Erro ao criar tabela Shift:', err.message); } 
    else { console.log('Tabela "Shift" (Refatorada) verificada/criada com sucesso.'); }
  });
}

// 4. Tabela Residente (Inalterada por enquanto)
function createTableResidente() {
  const sql = `
    CREATE TABLE IF NOT EXISTS Residente (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL, identificacao TEXT UNIQUE, dataNasc DATE,
      contatos TEXT, tags TEXT, ativo INTEGER DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME
    );
  `;
  db.run(sql, (err) => {
    if (err) { console.error('Erro ao criar tabela Residente:', err.message); } 
    else { console.log('Tabela "Residente" verificada/criada com sucesso.'); }
  });
}

// 5. Tabela Auditoria
function createTableAuditoria() {
  const sql = `
    CREATE TABLE IF NOT EXISTS Auditoria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      autorId INTEGER, acao TEXT NOT NULL, entidade TEXT, entidadeId INTEGER,
      diffs TEXT, motivo TEXT, origem TEXT, versaoApp TEXT,
      FOREIGN KEY (autorId) REFERENCES Colaborador(id)
    );
  `;
  db.run(sql, (err) => {
    if (err) { console.error('Erro ao criar tabela Auditoria:', err.message); } 
    else { console.log('Tabela "Auditoria" verificada/criada com sucesso.'); }
  });
}