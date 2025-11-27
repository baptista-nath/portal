# Portal de Notícias

Portal de Notícias completo com sistema de gerenciamento de conteúdo (CMS), desenvolvido com Node.js, Express, SQLite e Tailwind CSS.

## 🚀 Características

- ✅ **Front-end Responsivo**: Interface moderna com Tailwind CSS
- ✅ **Painel Administrativo**: Sistema completo de CRUD de notícias
- ✅ **Banco de Dados**: SQLite para armazenamento local
- ✅ **Suporte a Mídia**: Upload de imagens e vídeos (YouTube/Vimeo)
- ✅ **API RESTful**: Endpoints para consulta de notícias

## 📁 Estrutura do Projeto

```
Portal/
├── public/              # Arquivos estáticos
│   ├── index.html      # Página principal
│   ├── noticia.html    # Página de detalhes da notícia
│   ├── js/
│   │   ├── main.js     # Scripts da página principal
│   │   └── noticia.js  # Scripts da página de detalhes
│   └── css/
├── views/              # Templates EJS
│   ├── admin-lista.ejs              # Lista de notícias (admin)
│   ├── admin-nova-noticia.ejs       # Formulário de criação
│   └── admin-editar-noticia.ejs     # Formulário de edição
├── src/                # Código do servidor
│   ├── database.js     # Módulo de banco de dados
│   └── admin.js        # Rotas administrativas
├── server.js           # Servidor principal
├── package.json        # Dependências
└── noticias.db         # Banco de dados SQLite (criado automaticamente)
```

## 🛠️ Instalação

### Pré-requisitos

- Node.js (v14 ou superior)
- npm ou yarn

### Passos

1. **Instalar as dependências:**
   ```bash
   npm install
   ```

2. **Iniciar o servidor:**
   ```bash
   npm start
   ```

3. **Para desenvolvimento (com auto-reload):**
   ```bash
   npm run dev
   ```

4. **Acessar a aplicação:**
   - Site: http://localhost:3000
   - Painel Admin: http://localhost:3000/admin/noticias

## 📊 Modelagem de Dados

Cada notícia possui os seguintes campos:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | INTEGER | Sim (auto) | Identificador único |
| `titulo` | TEXT | Sim | Título da notícia |
| `subtitulo` | TEXT | Não | Subtítulo/chamada |
| `conteudo` | TEXT | Sim | Conteúdo completo |
| `imagem_url` | TEXT | Não | URL da imagem de destaque |
| `video_url` | TEXT | Não | URL do vídeo (YouTube/Vimeo) |
| `data_publicacao` | DATETIME | Sim (auto) | Data de criação |
| `autor` | TEXT | Sim | Nome do autor |

## 🔗 API Endpoints

### Públicos

- `GET /` - Página principal
- `GET /noticia.html?id={id}` - Detalhes de uma notícia
- `GET /api/noticias?limit={n}` - Lista últimas notícias (JSON)
- `GET /api/noticias/{id}` - Busca notícia por ID (JSON)

### Administrativos

- `GET /admin/noticias` - Lista todas as notícias
- `GET /admin/noticias/nova` - Formulário de criação
- `POST /admin/noticias/nova` - Criar nova notícia
- `GET /admin/noticias/editar/{id}` - Formulário de edição
- `POST /admin/noticias/editar/{id}` - Atualizar notícia
- `POST /admin/noticias/deletar/{id}` - Deletar notícia

## 💡 Uso

### Criando uma nova notícia

1. Acesse http://localhost:3000/admin/noticias
2. Clique em "Nova Notícia"
3. Preencha o formulário:
   - **Título**: Título principal da notícia
   - **Subtítulo**: Descrição breve (opcional)
   - **Autor**: Nome do autor
   - **URL da Imagem**: Link da imagem de destaque (opcional)
   - **URL do Vídeo**: Link do YouTube ou Vimeo (opcional)
   - **Conteúdo**: Texto completo da notícia
4. Clique em "Publicar Notícia"

### Gerenciando notícias

No painel administrativo você pode:
- ✏️ **Editar**: Modificar qualquer campo da notícia
- 👁️ **Visualizar**: Ver como a notícia aparece no site
- 🗑️ **Deletar**: Remover permanentemente a notícia

## 🎨 Personalização

### Estilização

O projeto usa Tailwind CSS via CDN. Para personalizar:
- Modifique as classes no HTML
- Adicione CSS customizado em `/public/css/`

### Banco de Dados

O SQLite é usado por padrão. Para usar outro banco:
- Modifique `src/database.js`
- Atualize o `package.json` com o driver apropriado

## 📝 Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Banco de Dados**: SQLite3
- **Template Engine**: EJS
- **Frontend**: HTML5, JavaScript (ES6+)
- **CSS Framework**: Tailwind CSS
- **Outras**: Body-parser

## 🔒 Segurança

⚠️ **Nota**: Este é um projeto de exemplo/estudo. Para produção, considere:
- Adicionar autenticação no painel admin
- Validação e sanitização de inputs
- Proteção contra SQL Injection (já implementada com prepared statements)
- HTTPS
- Rate limiting
- Upload de arquivos em vez de URLs

## 📄 Licença

MIT

## 👥 Contribuindo

Sinta-se à vontade para abrir issues e pull requests!

---

Desenvolvido com ❤️ usando Node.js e Express
