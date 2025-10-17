// Documentação: Arquivo principal do servidor.
// [MODIFICADO] Adicionados console.log para depuração.

const express = require('express');
const cors = require('cors');
const db = require('./db.js');
const { registrarLog } = require('./auditLogger.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./authMiddleware.js');

const JWT_SECRET = 'MediShiftNeo_eh_o_melhor_projeto_do_mundo_12345';
const app = express();
const PORT = 3001;
const corsOptions = { origin: 'http://localhost:5173' };

console.log('>>> PONTO 1: Iniciando configuração do Express...');
app.use(cors(corsOptions));
app.use(express.json());
console.log('>>> PONTO 2: Middlewares iniciais (cors, json) configurados.');

// --- ROTAS PÚBLICAS ---
app.get('/api', (req, res) => {
  console.log('>>> ROTA PÚBLICA /api ACESSADA <<<');
  res.json({ message: 'API do Backend MediShiftNeo está no ar!' });
});

app.post('/api/login', (req, res) => {
  console.log('>>> ROTA PÚBLICA /api/login ACESSADA <<<');
  const { telefone, senha } = req.body;
  // ... (restante do código de login inalterado, exceto por logs internos se necessário) ...
  if (!telefone || !senha) { return res.status(400).json({ error: 'Telefone e Senha são obrigatórios.' }); }
  const sql = "SELECT * FROM Colaborador WHERE telefone = ?";
  console.log('>>> Login: Buscando colaborador...');
  db.get(sql, [telefone], (err, colaborador) => {
    if (err) { console.error('!!! Erro no db.get (login):', err.message); return res.status(500).json({ error: 'Erro interno do servidor.' }); }
    if (!colaborador) { console.log('>>> Login: Colaborador não encontrado.'); return res.status(401).json({ error: 'Credenciais inválidas.' }); }
    console.log('>>> Login: Colaborador encontrado. Comparando senha...');
    bcrypt.compare(senha, colaborador.senha, (err, isMatch) => {
      if (err) { console.error('!!! Erro no bcrypt.compare:', err.message); return res.status(500).json({ error: 'Erro ao verificar a senha.' }); }
      if (!isMatch) { console.log('>>> Login: Senha incorreta.'); return res.status(401).json({ error: 'Credenciais inválidas.' }); }
      console.log('>>> Login: Senha correta. Gerando token...');
      const payload = { id: colaborador.id, nome: colaborador.nome, funcao: colaborador.funcao };
      jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' }, (err, token) => {
        if (err) { console.error('!!! Erro no jwt.sign:', err.message); return res.status(500).json({ error: 'Erro ao gerar o token de login.' }); }
        console.log('>>> Login: Token gerado. Enviando resposta.');
        res.json({ message: 'Login bem-sucedido!', token: token, colaborador: payload });
      });
    });
  });
});

// --- ATIVANDO O "SEGURANÇA" ---
console.log('>>> PONTO 3: Configurando middleware de autenticação...');
// Modificando para logar dentro do middleware também
const wrappedAuthMiddleware = (req, res, next) => {
    console.log('>>> MIDDLEWARE AUTH: Verificando token...');
    authMiddleware(req, res, (err) => {
        if (err) {
             console.error('!!! Erro DENTRO do authMiddleware:', err);
             // Se o próprio middleware retornar um erro (embora não devesse no nosso código)
             return res.status(500).json({ error: 'Erro interno no middleware de autenticação.'});
        }
        if (!res.headersSent) { // Só chama next se a resposta não foi enviada ainda
             console.log('>>> MIDDLEWARE AUTH: Token OK, passando para próxima rota.');
             next();
        } else {
             console.log('>>> MIDDLEWARE AUTH: Resposta já enviada (provavelmente erro 401 ou 403).');
        }
    });
};
app.use(wrappedAuthMiddleware);
console.log('>>> PONTO 4: Middleware de autenticação ATIVADO.');

// --- ROTAS PROTEGIDAS ---

// --- ROTAS DE COLABORADORES ---
app.get('/api/colaboradores', (req, res) => {
  console.log('>>> ROTA PROTEGIDA /api/colaboradores (GET) ACESSADA <<<');
  const sql = "SELECT id, nome, email, telefone, funcao, status FROM Colaborador";
  console.log('>>> Colaboradores GET: Executando SQL...');
  db.all(sql, [], (err, rows) => {
    console.log('>>> Colaboradores GET: Callback do db.all.');
    if (err) { console.error('!!! Erro no db.all (GET Colab):', err.message); res.status(500).json({ error: err.message }); return; }
    console.log('>>> Colaboradores GET: Enviando resposta.');
    res.json({ colaboradores: rows });
  });
});

// ... (Restante das rotas POST, PUT, DELETE Colaborador, Unidade, Shift, Residente, Auditoria) ...
// Adicionar logs semelhantes (`console.log('>>> ROTA X ACESSADA <<<');` no início de cada uma)
// e antes/depois das chamadas de banco (`db.get`, `db.run`, `db.all`) se necessário.

// --- ROTAS DE UNIDADES ---
app.get('/api/unidades', (req, res) => {
  console.log('>>> ROTA PROTEGIDA /api/unidades (GET) ACESSADA <<<');
  const sql = "SELECT * FROM Unidade ORDER BY nome";
   console.log('>>> Unidades GET: Executando SQL...');
  db.all(sql, [], (err, rows) => {
    console.log('>>> Unidades GET: Callback do db.all.');
    if (err) { res.status(500).json({ error: err.message }); return; }
    console.log('>>> Unidades GET: Enviando resposta.');
    res.json({ unidades: rows });
  });
});
// ... (POST, DELETE Unidade com logs) ...

// --- ROTAS DE PLANTÕES (SHIFTS) ---
app.get('/api/shifts', (req, res) => {
  console.log('>>> ROTA PROTEGIDA /api/shifts (GET) ACESSADA <<<');
  const sql = `SELECT s.id, s.dataPlantao, s.turno, s.status, s.participantes, s.referenciaId, u.nome as nomeUnidade FROM Shift s JOIN Unidade u ON s.unidadeId = u.id ORDER BY s.dataPlantao DESC, s.turno DESC`;
  console.log('>>> Shifts GET: Executando SQL...');
  db.all(sql, [], (err, rows) => {
     console.log('>>> Shifts GET: Callback do db.all.');
    if (err) { res.status(500).json({ error: err.message }); return; }
     console.log('>>> Shifts GET: Enviando resposta.');
    res.json({ shifts: rows });
  });
});
// ... (POST Shift com logs) ...


// --- ROTAS DE RESIDENTES ---
app.get('/api/residentes', (req, res) => {
   console.log('>>> ROTA PROTEGIDA /api/residentes (GET) ACESSADA <<<');
  const sql = "SELECT id, nome, identificacao, dataNasc FROM Residente WHERE ativo = 1 ORDER BY nome";
  console.log('>>> Residentes GET: Executando SQL...');
  db.all(sql, [], (err, rows) => {
    console.log('>>> Residentes GET: Callback do db.all.');
    if (err) { res.status(500).json({ error: err.message }); return; }
    console.log('>>> Residentes GET: Enviando resposta.');
    res.json({ residentes: rows });
  });
});
// ... (POST Residente com logs) ...

// --- ROTA DE AUDITORIA ---
app.get('/api/auditoria', (req, res) => {
  console.log('>>> ROTA PROTEGIDA /api/auditoria (GET) ACESSADA <<<');
  const sql = "SELECT * FROM Auditoria ORDER BY timestamp DESC";
  console.log('>>> Auditoria GET: Executando SQL...');
  db.all(sql, [], (err, rows) => {
     console.log('>>> Auditoria GET: Callback do db.all.');
    if (err) { res.status(500).json({ error: err.message }); return; }
    console.log('>>> Auditoria GET: Enviando resposta.');
    res.json({ logs: rows });
  });
});

// --- FIM DAS ROTAS DA API ---

console.log('>>> PONTO 5: Configuração das rotas concluída.');

app.listen(PORT, () => {
  console.log(`>>> PONTO 6: Servidor INICIADO e rodando na porta ${PORT} <<<`);
});

// --- CÓDIGO RESTANTE (POST/PUT/DELETE com logs adicionados se necessário) ---
// (Adicione `console.log` no início e antes/depois de `db.run` nas rotas restantes se quiser depuração completa)
// ... (Código completo das rotas POST/PUT/DELETE Colaborador, Unidade, Shift, Residente) ...

// Copiando o restante para garantir que não falte nada (sem adicionar logs extras aqui por brevidade)
// POST Colaboradores
app.post('/api/colaboradores', (req, res) => { console.log('>>> ROTA PROTEGIDA /api/colaboradores (POST) ACESSADA <<<'); const { nome, email, telefone, funcao, senha } = req.body; if (!nome || !funcao || !senha) { return res.status(400).json({ error: 'Nome, Função e Senha são obrigatórios.' }); } bcrypt.hash(senha, 10, (err, hash) => { if (err) { return res.status(500).json({ error: 'Erro ao hashear a senha.' }); } const sql = `INSERT INTO Colaborador (nome, email, telefone, senha, funcao, status) VALUES (?, ?, ?, ?, ?, ?)`; db.run(sql, [nome, email, telefone, hash, funcao, 'ativo'], function(err) { if (err) { console.error('ERRO NO INSERT DO COLABORADOR:', err.message); res.status(500).json({ error: err.message }); return; } const novoId = this.lastID; const logBody = { ...req.body }; delete logBody.senha; registrarLog({ autorId: req.colaborador.id, acao: 'CRIAR_COLABORADOR', entidade: 'Colaborador', entidadeId: novoId, diffs: { novo: logBody } }); res.status(201).json({ message: 'Colaborador criado com sucesso!', colaboradorId: novoId }); }); }); });
// PUT Colaboradores
app.put('/api/colaboradores/:id', (req, res) => { console.log('>>> ROTA PROTEGIDA /api/colaboradores/:id (PUT) ACESSADA <<<'); const colaboradorId = req.params.id; const { nome, email, telefone, funcao } = req.body; db.get("SELECT * FROM Colaborador WHERE id = ?", [colaboradorId], (err, antigoColaborador) => { if (err) { return res.status(500).json({ error: 'Erro ao buscar dados antigos.' }); } if (!antigoColaborador) { return res.status(404).json({ error: 'Colaborador não encontrado.' }); } const dadosAntigosLog = { nome: antigoColaborador.nome, email: antigoColaborador.email, telefone: antigoColaborador.telefone, funcao: antigoColaborador.funcao, }; const sql = `UPDATE Colaborador SET nome = ?, email = ?, telefone = ?, funcao = ? WHERE id = ?`; db.run(sql, [nome, email, telefone, funcao, colaboradorId], function(err) { if (err) { return res.status(500).json({ error: err.message }); } registrarLog({ autorId: req.colaborador.id, acao: 'EDITAR_COLABORADOR', entidade: 'Colaborador', entidadeId: colaboradorId, diffs: { antigo: dadosAntigosLog, novo: req.body } }); res.json({ message: 'Colaborador atualizado com sucesso!' }); }); }); });
// PUT Status Colaborador
app.put('/api/colaboradores/:id/status', (req, res) => { console.log('>>> ROTA PROTEGIDA /api/colaboradores/:id/status (PUT) ACESSADA <<<'); const colaboradorId = req.params.id; const { novoStatus } = req.body; if (novoStatus !== 'ativo' && novoStatus !== 'inativo') { return res.status(400).json({ error: "Status deve ser 'ativo' ou 'inativo'." }); } db.get("SELECT status FROM Colaborador WHERE id = ?", [colaboradorId], (err, antigoColaborador) => { if (err) { return res.status(500).json({ error: 'Erro ao buscar status antigo.' }); } if (!antigoColaborador) { return res.status(404).json({ error: 'Colaborador não encontrado.' }); } const sql = `UPDATE Colaborador SET status = ? WHERE id = ?`; db.run(sql, [novoStatus, colaboradorId], function(err) { if (err) { return res.status(500).json({ error: err.message }); } registrarLog({ autorId: req.colaborador.id, acao: 'MUDAR_STATUS_COLABORADOR', entidade: 'Colaborador', entidadeId: colaboradorId, diffs: { antigo: { status: antigoColaborador.status }, novo: { status: novoStatus } } }); res.json({ message: `Colaborador ${novoStatus} com sucesso!` }); }); }); });
// DELETE Colaborador
app.delete('/api/colaboradores/:id', (req, res) => { console.log('>>> ROTA PROTEGIDA /api/colaboradores/:id (DELETE) ACESSADA <<<'); if (req.colaborador.funcao !== 'Admin') { return res.status(403).json({ error: 'Acesso negado. Apenas Admins podem excluir colaboradores.' }); } const colaboradorId = req.params.id; db.get("SELECT * FROM Colaborador WHERE id = ?", [colaboradorId], (err, colaborador) => { if (err) { return res.status(500).json({ error: 'Erro ao buscar dados.' }); } if (!colaborador) { return res.status(404).json({ error: 'Colaborador não encontrado.' }); } const sql = `DELETE FROM Colaborador WHERE id = ?`; db.run(sql, [colaboradorId], function(err) { if (err) { return res.status(500).json({ error: err.message }); } registrarLog({ autorId: req.colaborador.id, acao: 'EXCLUIR_COLABORADOR', entidade: 'Colaborador', entidadeId: colaboradorId, diffs: { antigo: colaborador } }); res.json({ message: `Colaborador (ID: ${colaboradorId}) excluído com sucesso!` }); }); }); });
// POST Unidades
app.post('/api/unidades', (req, res) => { console.log('>>> ROTA PROTEGIDA /api/unidades (POST) ACESSADA <<<'); if (req.colaborador.funcao !== 'Admin' && req.colaborador.funcao !== 'Coordenador') { return res.status(403).json({ error: 'Acesso negado.' }); } const { nome } = req.body; if (!nome) { return res.status(400).json({ error: 'Nome é obrigatório.' }); } const sql = `INSERT INTO Unidade (nome) VALUES (?)`; db.run(sql, [nome], function(err) { if (err) { if (err.errno === 19) { return res.status(409).json({ error: 'Erro: Nome da unidade já existe.' }); } res.status(500).json({ error: err.message }); return; } const novoId = this.lastID; registrarLog({ autorId: req.colaborador.id, acao: 'CRIAR_UNIDADE', entidade: 'Unidade', entidadeId: novoId, diffs: { novo: req.body } }); res.status(201).json({ message: 'Unidade criada com sucesso!', unidadeId: novoId }); }); });
// DELETE Unidades
app.delete('/api/unidades/:id', (req, res) => { console.log('>>> ROTA PROTEGIDA /api/unidades/:id (DELETE) ACESSADA <<<'); if (req.colaborador.funcao !== 'Admin' && req.colaborador.funcao !== 'Coordenador') { return res.status(403).json({ error: 'Acesso negado.' }); } const unidadeId = req.params.id; db.get("SELECT * FROM Unidade WHERE id = ?", [unidadeId], (err, unidade) => { if (err) { return res.status(500).json({ error: 'Erro ao buscar dados.' }); } if (!unidade) { return res.status(404).json({ error: 'Unidade não encontrada.' }); } const sql = `DELETE FROM Unidade WHERE id = ?`; db.run(sql, [unidadeId], function(err) { if (err) { return res.status(500).json({ error: 'Erro ao excluir. Verifique se a unidade está em uso por algum plantão.' }); } registrarLog({ autorId: req.colaborador.id, acao: 'EXCLUIR_UNIDADE', entidade: 'Unidade', entidadeId: unidadeId, diffs: { antigo: unidade } }); res.json({ message: `Unidade (ID: ${unidadeId}) excluída com sucesso!` }); }); }); });
// POST Shifts
app.post('/api/shifts', (req, res) => { console.log('>>> ROTA PROTEGIDA /api/shifts (POST) ACESSADA <<<'); const { unidadeId, dataPlantao, turno, participantes } = req.body; if (!unidadeId || !dataPlantao || !turno) { return res.status(400).json({ error: 'Unidade, Data e Turno são obrigatórios.' }); } if (turno !== 'Dia' && turno !== 'Noite') { return res.status(400).json({ error: "Turno deve ser 'Dia' ou 'Noite'." }); } if (!/^\d{4}-\d{2}-\d{2}$/.test(dataPlantao)) { return res.status(400).json({ error: 'Formato de Data inválido. Use YYYY-MM-DD.' }); } const participantesJson = JSON.stringify(participantes || []); const sql = `INSERT INTO Shift (unidadeId, dataPlantao, turno, participantes) VALUES (?, ?, ?, ?)`; db.run(sql, [unidadeId, dataPlantao, turno, participantesJson], function(err) { if (err) { res.status(500).json({ error: err.message }); return; } const novoId = this.lastID; registrarLog({ autorId: req.colaborador.id, acao: 'CRIAR_PLANTAO', entidade: 'Shift', entidadeId: novoId, diffs: { novo: req.body } }); res.status(201).json({ message: 'Plantão criado com sucesso!', shiftId: novoId }); }); });
// POST Residentes
app.post('/api/residentes', (req, res) => { console.log('>>> ROTA PROTEGIDA /api/residentes (POST) ACESSADA <<<'); const { nome, identificacao, dataNasc } = req.body; if (!nome) { return res.status(400).json({ error: 'Nome é obrigatório.' }); } const sql = `INSERT INTO Residente (nome, identificacao, dataNasc) VALUES (?, ?, ?)`; db.run(sql, [nome, identificacao, dataNasc], function(err) { if (err) { if (err.errno === 19) { return res.status(409).json({ error: 'Erro: Identificação já existe.' }); } res.status(500).json({ error: err.message }); return; } const novoId = this.lastID; registrarLog({ autorId: req.colaborador.id, acao: 'CRIAR_RESIDENTE', entidade: 'Residente', entidadeId: novoId, diffs: { novo: req.body } }); res.status(201).json({ message: 'Residente criado com sucesso!', residenteId: novoId }); }); });