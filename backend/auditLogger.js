// Documentação: Este é o nosso assistente de auditoria.
// Ele centraliza a lógica de como salvar um log no banco de dados.

const db = require('./db.js'); // Importa a conexão com o banco

/**
 * Registra um evento na tabela de Auditoria.
 * @param {object} logData - Os dados do log.
 * @param {number} logData.autorId - ID do colaborador que fez a ação (opcional).
 * @param {string} logData.acao - A ação realizada (ex: 'CRIAR_COLABORADOR').
 * @param {string} logData.entidade - A tabela afetada (ex: 'Colaborador').
 * @param {number} logData.entidadeId - O ID do registro afetado (ex: o ID do novo colaborador).
 * @param {object} logData.diffs - O que mudou (JSON).
 */
function registrarLog(logData) {
  // Define valores padrão
  const {
    autorId = null, // No futuro, pegaremos isso do usuário logado
    acao,
    entidade = null,
    entidadeId = null,
    diffs = {},
    motivo = null,
    origem = 'API_SERVER', // De onde veio a ação
    versaoApp = '0.1.0'
  } = logData;

  // Converte o objeto 'diffs' em texto JSON para salvar no banco
  const diffsJson = JSON.stringify(diffs);

  const sql = `
    INSERT INTO Auditoria 
    (autorId, acao, entidade, entidadeId, diffs, motivo, origem, versaoApp) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [autorId, acao, entidade, entidadeId, diffsJson, motivo, origem, versaoApp], (err) => {
    if (err) {
      console.error('ERRO AO REGISTRAR LOG DE AUDITORIA:', err.message);
    } else {
      console.log(`[Auditoria] Log registrado: ${acao}`);
    }
  });
}

// "Exporta" a função para que outros arquivos (como o server.js) possam usá-la
module.exports = {
  registrarLog
};