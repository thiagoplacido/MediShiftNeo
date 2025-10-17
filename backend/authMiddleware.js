// Documentação: Middleware de autenticação.
// [MODIFICADO] Agora usa 'funcao' em vez de 'papel'.

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'MediShiftNeo_eh_o_melhor_projeto_do_mundo_12345';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (token == null) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, colaborador) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido.' });
    }

    // [MODIFICADO] Anexamos o colaborador ao 'req'
    // O payload do token agora terá 'funcao'
    req.colaborador = colaborador;
    
    next();
  });
}

module.exports = authMiddleware;