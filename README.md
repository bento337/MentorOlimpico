# 🏆 Mentor Olímpico

> Plataforma educacional para preparação em olimpíadas acadêmicas de matemática

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.3.0-FFCA28?logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.11-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## 📖 Sobre o Projeto

O **Mentor Olímpico** é uma plataforma web desenvolvida para auxiliar estudantes na preparação para olimpíadas acadêmicas de matemática, como a OBMEP, OMIF e OIMSF. A aplicação oferece trilhas de estudo personalizadas, cronogramas inteligentes e acesso organizado a materiais de qualidade.

### 🎯 Objetivo

Facilitar o acesso à preparação olímpica através de:
- **Trilhas de estudo** organizadas por olimpíada e fase
- **Cronogramas personalizados** baseados no tempo disponível do estudante
- **Materiais de estudo** curados (vídeos, exercícios, teoria)
- **Acompanhamento de progresso** visual e intuitivo

### 👥 Público-Alvo

- Estudantes do 6º ano do Ensino Fundamental ao 3º ano do Ensino Médio
- Competidores de olimpíadas acadêmicas (OBMEP, OMIF, OIMSF)
- Professores e educadores que orientam estudantes
- Qualquer pessoa interessada em matemática olímpica

### 🎓 Contexto do Projeto

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso (TCC) por estudantes do ensino médio técnico do CEFET-MG, baseado em suas próprias experiências com olimpíadas acadêmicas. O objetivo é tornar o processo de preparação mais acessível e organizado para outros jovens com grandes sonhos.

---

## ✨ Funcionalidades Principais

### 🔐 Autenticação
- ✅ Cadastro e login com Firebase Auth
- ✅ Recuperação de senha
- ✅ Perfil de usuário personalizado
- ✅ Upload de foto de perfil

### 🎨 Interface
- ✅ Tema claro/escuro (dark mode)
- ✅ Design responsivo (mobile-first)
- ✅ UI moderna com shadcn/ui
- ✅ Navegação intuitiva

### 📚 Trilhas de Estudo
- ✅ Trilhas organizadas por olimpíada (OBMEP, OMIF, OIMSF)
- ✅ Matérias ordenadas por importância e relevância
- ✅ Materiais de estudo categorizados:
  - 📘 Material teórico (sites)
  - 🎥 Videoaulas
  - 📝 Lista de exercícios
  - 🎬 Resoluções em vídeo
- ✅ Gráficos de distribuição de importância

### 📅 Cronogramas Personalizados
- ✅ Geração automática de cronogramas
- ✅ Algoritmo inteligente de distribuição de matérias
- ✅ Configuração personalizada:
  - Seleção de olimpíada
  - Data de início e data da prova
  - Horas de estudo por semana
- ✅ Visualização detalhada por semana
- ✅ Acompanhamento de progresso
- ✅ Exportação em PDF
- ✅ Salvamento automático no Firebase

### 👤 Área do Usuário
- ✅ Dashboard personalizado
- ✅ Visualização de cronogramas salvos
- ✅ Acesso rápido a trilhas e configurações
- ✅ Recomendações personalizadas

### ⚙️ Configurações
- ✅ Edição de perfil (nome, bio, escola, série)
- ✅ Preferências de estudo
- ✅ Metas de estudo personalizadas
- ✅ Configurações de notificações
- ✅ Alteração de senha

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **[React 19.1.0](https://react.dev/)** - Biblioteca JavaScript para construção de interfaces
- **[Vite 7.0.0](https://vitejs.dev/)** - Build tool e dev server ultra-rápido
- **[React Router 7.6.3](https://reactrouter.com/)** - Roteamento declarativo
- **[Tailwind CSS 4.1.11](https://tailwindcss.com/)** - Framework CSS utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes UI baseados em Radix UI

### Backend & Serviços
- **[Firebase 12.3.0](https://firebase.google.com/)** - Plataforma backend como serviço
  - **Firebase Auth** - Autenticação de usuários
  - **Cloud Firestore** - Banco de dados NoSQL
  - **Firebase Storage** - Armazenamento de arquivos

### Bibliotecas Auxiliares
- **[date-fns 4.1.0](https://date-fns.org/)** - Manipulação de datas
- **[jsPDF 3.0.3](https://github.com/parallax/jsPDF)** - Geração de PDFs
- **[Recharts 2.15.4](https://recharts.org/)** - Gráficos e visualizações
- **[Lucide React 0.525.0](https://lucide.dev/)** - Biblioteca de ícones

### Ferramentas de Desenvolvimento
- **[ESLint](https://eslint.org/)** - Linter para JavaScript
- **[TypeScript Types](https://www.typescriptlang.org/)** - Tipos para melhor DX

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos

- **Node.js** 18+ e **npm** (ou **yarn**)
- Conta no Firebase (para configurar o projeto)

### Passo a Passo

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd Teste
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o Firebase**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Obtenha as credenciais do projeto
   - Atualize `src/services/firebaseConfig.js` com suas credenciais:
     ```javascript
     const firebaseConfig = {
       apiKey: "SUA_API_KEY",
       authDomain: "SEU_AUTH_DOMAIN",
       projectId: "SEU_PROJECT_ID",
       // ... outras configurações
     }
     ```

4. **Configure as regras do Firestore**
   - No Firebase Console, vá em Firestore Database > Rules
   - Configure regras de segurança adequadas (exemplo básico):
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /cronogramas/{document=**} {
           allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
         }
         match /usuarios/{userId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
         match /Materias/{document=**} {
           allow read: if true;
           allow write: if false; // Apenas leitura pública
         }
       }
     }
     ```

5. **Configure as regras do Storage**
   - No Firebase Console, vá em Storage > Rules
   - Configure regras para upload de fotos:
     ```javascript
     rules_version = '2';
     service firebase.storage {
       match /b/{bucket}/o {
         match /profile-pictures/{userId}/{allPaths=**} {
           allow read: if true;
           allow write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
     ```

6. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

7. **Acesse a aplicação**
   - Abra o navegador em `http://localhost:5173` (ou a porta indicada no terminal)

---

## 📦 Como Fazer o Build

Para gerar a versão de produção:

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

Para visualizar o build localmente:

```bash
npm run preview
```

---

## 🌐 Como Fazer o Deploy no Vercel

### Opção 1: Via CLI

1. **Instale a Vercel CLI** (se ainda não tiver)
   ```bash
   npm i -g vercel
   ```

2. **Faça login na Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Siga as instruções no terminal
   - A Vercel detectará automaticamente que é um projeto Vite

### Opção 2: Via GitHub (Recomendado)

1. **Faça push do código para o GitHub**

2. **Acesse [vercel.com](https://vercel.com/)**

3. **Conecte seu repositório**
   - Clique em "Add New Project"
   - Importe o repositório do GitHub
   - A Vercel detectará automaticamente as configurações

4. **Configure variáveis de ambiente** (se necessário)
   - No dashboard do projeto, vá em Settings > Environment Variables
   - Adicione variáveis necessárias

5. **Deploy automático**
   - A cada push na branch principal, o deploy será feito automaticamente

### Configurações Importantes

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Variáveis de Ambiente

Se você quiser usar variáveis de ambiente para as credenciais do Firebase (recomendado para produção):

1. Crie um arquivo `.env.local`:
   ```env
   VITE_FIREBASE_API_KEY=sua_api_key
   VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
   VITE_FIREBASE_PROJECT_ID=seu_project_id
   # ... outras variáveis
   ```

2. Atualize `firebaseConfig.js` para usar variáveis:
   ```javascript
   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     // ...
   }
   ```

3. Adicione as variáveis no dashboard da Vercel

---

## 📁 Estrutura de Pastas

```
Teste/
├── public/                 # Arquivos públicos (imagens, favicon)
│   ├── Logo_Branca_Final.png
│   ├── Logo_Preta_Final.png
│   └── ...
├── src/
│   ├── assets/            # Assets do projeto
│   │   └── logo.ico
│   ├── components/        # Componentes React
│   │   ├── ui/           # Componentes UI (shadcn/ui)
│   │   ├── Header.jsx
│   │   ├── PrivateRoute.jsx
│   │   └── ThemeToggle.jsx
│   ├── hooks/            # Hooks personalizados
│   │   ├── useAuth.js
│   │   └── use-mobile.js
│   ├── lib/              # Utilitários
│   │   └── utils.js
│   ├── pages/            # Páginas/rotas
│   │   ├── Home.jsx
│   │   ├── LandingPage.jsx
│   │   ├── Login.jsx
│   │   ├── Cadastro.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Trilhas.jsx
│   │   ├── Trilha.jsx
│   │   ├── Cronogramas.jsx
│   │   ├── Cronograma.jsx
│   │   ├── Configuracoes.jsx
│   │   └── QuemSomos.jsx
│   ├── services/         # Serviços externos
│   │   ├── firebaseConfig.js
│   │   └── authService.js
│   ├── index.css        # Estilos globais
│   └── main.jsx         # Ponto de entrada
├── .gitignore
├── components.json      # Configuração shadcn/ui
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 📸 Screenshots

<!-- TODO: Adicionar screenshots do projeto -->
- [ ] Dashboard
- [ ] Página de Trilhas
- [ ] Cronograma Gerado
- [ ] Configurações
- [ ] Tema Escuro

---

## 🤝 Contribuindo

Este é um projeto acadêmico, mas contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👨‍💻 Autores

- **Equipe Mentor Olímpico** - Ana Luisa Diniz, Bento Enrico e Ítalo Gontijo
  - Desenvolvido como Trabalho de Conclusão de Curso (TCC)

---

## 🙏 Agradecimentos

- CEFET-MG pela oportunidade e suporte
- Comunidade de desenvolvedores React e Firebase
- Todos os estudantes que testaram e deram feedback

---

## 🔗 Links Úteis

- [Documentação Técnica](./DOCUMENTACAO_PROJETO.md) - Documentação detalhada do projeto
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

