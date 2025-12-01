# Portal de Notícias - Versão Estática

## 📰 Apresentação para o Cliente

Esta é a **versão estática** do Portal de Notícias, preparada para visualização e aprovação do cliente.

### 🎯 O que está incluído nesta versão:

- ✅ **Página Principal** (`index.html`) - Layout completo do portal
- ✅ **Página de Notícia** (`noticia.html`) - Template para exibição individual
- ✅ **Estilos CSS** - Design responsivo e profissional
- ✅ **JavaScript** - Interatividade básica do front-end

### 🌐 Como Visualizar

Basta abrir o arquivo `public/index.html` em qualquer navegador moderno:

```bash
# Abra diretamente no navegador
open public/index.html

# Ou usando um servidor HTTP simples (Python 3)
python3 -m http.server 8000
# Acesse: http://localhost:8000/public/
```

### 📁 Estrutura de Arquivos

```
public/
├── index.html          # Página principal do portal
├── noticia.html        # Template de notícia individual
├── css/                # Estilos
│   └── style.css
├── js/                 # Scripts
│   ├── main.js
│   └── noticia.js
└── uploads/            # Diretório para imagens
```

### 🎨 Características do Design

- **Layout Estilo Jornal** - Design tradicional e elegante
- **Responsivo** - Adaptável a desktop, tablet e mobile
- **Tipografia Profissional** - Fontes Merriweather e Open Sans
- **Grid de Notícias** - Organização clara e hierarquizada
- **Seções Categorizadas** - Esportes, Política, Economia, Cultura

### 📝 Notas Importantes

Esta é uma **versão de apresentação** contendo apenas HTML, CSS e JavaScript puro.

A versão completa com backend (Node.js, Express, SQLite, Sistema Admin) está disponível na branch `admin-completo`.

### 🔗 Links Úteis

- **Repositório:** https://github.com/baptista-nath/portal
- **Branch Estática:** `main`
- **Branch Completa:** `admin-completo`

---

**Desenvolvido para:** Portal de Notícias  
**Data:** Novembro 2025  
**Status:** ✅ Pronto para Apresentação
