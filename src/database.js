const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'noticias.db');
const db = new sqlite3.Database(dbPath);

// Inicializar banco de dados
const init = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS noticias (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT NOT NULL,
          subtitulo TEXT,
          conteudo TEXT NOT NULL,
          imagem_url TEXT,
          video_url TEXT,
          data_publicacao DATETIME DEFAULT CURRENT_TIMESTAMP,
          autor TEXT NOT NULL
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Banco de dados inicializado com sucesso');
          resolve();
        }
      });
    });
  });
};

// Buscar últimas notícias
const getLatestNoticias = (limit = 5) => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM noticias ORDER BY data_publicacao DESC LIMIT ?',
      [limit],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
};

// Buscar todas as notícias
const getAllNoticias = () => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM noticias ORDER BY data_publicacao DESC',
      [],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
};

// Buscar notícia por ID
const getNoticiaById = (id) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM noticias WHERE id = ?',
      [id],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
};

// Criar nova notícia
const createNoticia = (noticia) => {
  return new Promise((resolve, reject) => {
    const { titulo, subtitulo, conteudo, imagem_url, video_url, autor } = noticia;
    db.run(
      `INSERT INTO noticias (titulo, subtitulo, conteudo, imagem_url, video_url, autor)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [titulo, subtitulo, conteudo, imagem_url, video_url, autor],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      }
    );
  });
};

// Atualizar notícia
const updateNoticia = (id, noticia) => {
  return new Promise((resolve, reject) => {
    const { titulo, subtitulo, conteudo, imagem_url, video_url, autor } = noticia;
    db.run(
      `UPDATE noticias 
       SET titulo = ?, subtitulo = ?, conteudo = ?, imagem_url = ?, video_url = ?, autor = ?
       WHERE id = ?`,
      [titulo, subtitulo, conteudo, imagem_url, video_url, autor, id],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      }
    );
  });
};

// Deletar notícia
const deleteNoticia = (id) => {
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM noticias WHERE id = ?',
      [id],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      }
    );
  });
};

module.exports = {
  init,
  getLatestNoticias,
  getAllNoticias,
  getNoticiaById,
  createNoticia,
  updateNoticia,
  deleteNoticia
};
