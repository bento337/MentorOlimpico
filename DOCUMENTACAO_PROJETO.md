# 📚 Documentação Técnica - Mentor Olímpico

## 📁 Estrutura de Pastas

### `/src`
Diretório principal do código-fonte da aplicação.

#### `/src/pages`
Contém todas as páginas/rotas da aplicação. Cada arquivo representa uma rota diferente.

#### `/src/components`
Componentes reutilizáveis da aplicação, incluindo:
- Componentes de UI (baseados em shadcn/ui)
- Componentes de layout (Header, PrivateRoute)
- Componentes funcionais (ThemeToggle, search-form)

#### `/src/hooks`
Hooks personalizados do React que encapsulam lógica reutilizável.

#### `/src/services`
Serviços que fazem comunicação com APIs externas e Firebase.

#### `/src/assets`
Arquivos estáticos como imagens, ícones e outros recursos.

#### `/src/lib`
Bibliotecas utilitárias e funções auxiliares.

#### `/public`
Arquivos públicos acessíveis diretamente via URL (imagens, favicon, etc.).

---

## 📄 Explicação de Cada Página

### 1. **Home.jsx** (Componente Principal Inteligente)

**O que faz:**
- Componente roteador inteligente que decide qual página mostrar baseado no estado de autenticação do usuário.
- Se o usuário estiver logado, mostra o Dashboard.
- Se não estiver logado, mostra a LandingPage.

**Principais funções:**
- `useAuth()`: Hook que verifica o estado de autenticação.
- Renderização condicional baseada em `user` e `loading`.

**Hooks utilizados:**
- `useAuth`: Verifica se o usuário está autenticado.
- `useNavigate`: Para navegação programática (não usado diretamente, mas disponível).

**Serviços externos:**
- Firebase Auth (via `useAuth` hook).

**Fluxo de funcionamento:**
1. Carrega o estado de autenticação.
2. Se estiver carregando, mostra spinner.
3. Se usuário autenticado → renderiza `<Dashboard />`.
4. Se usuário não autenticado → renderiza `<LandingPage />`.

**Conexão com o sistema:**
- É a rota raiz (`/`) definida em `main.jsx`.
- Atua como gateway inteligente para o resto da aplicação.

---

### 2. **LandingPage.jsx**

**O que faz:**
- Página inicial pública para visitantes não autenticados.
- Apresenta o projeto, suas funcionalidades e convida ao cadastro.

**Principais funções:**
- Exibição de informações sobre o projeto.
- Links para trilhas, cadastro e login.
- Footer com informações de contato.

**Hooks utilizados:**
- Nenhum hook personalizado.

**Serviços externos:**
- Nenhum serviço externo direto.

**Seções importantes:**
- Hero section com call-to-action.
- Cards explicativos sobre funcionalidades.
- Seção "Por que usar o Mentor Olímpico?".
- Footer com links úteis.

**Fluxo de funcionamento:**
1. Renderiza informações estáticas sobre o projeto.
2. Oferece links para cadastro/login.
3. Apresenta trilhas disponíveis.

**Conexão com o sistema:**
- Renderizada quando usuário não está autenticado na rota `/`.
- Usa o componente `Header` para navegação.

---

### 3. **Login.jsx**

**O que faz:**
- Página de autenticação para usuários existentes.
- Permite login com email e senha.

**Principais funções:**
- `handleLogin`: Processa o formulário de login.
- Validação de campos.
- Tratamento de erros do Firebase Auth.

**Hooks utilizados:**
- `useState`: Gerencia estado do formulário (email, senha, erro, loading).
- `useNavigate`: Redireciona após login bem-sucedido.

**Serviços externos:**
- `authService.loginUser`: Função que autentica o usuário no Firebase.

**Fluxo de funcionamento:**
1. Usuário preenche email e senha.
2. Submete o formulário.
3. Chama `loginUser(email, senha)`.
4. Se sucesso → redireciona para `/` (Home inteligente).
5. Se erro → exibe mensagem de erro específica.

**Tratamento de erros:**
- `auth/user-not-found`: Usuário não encontrado.
- `auth/wrong-password`: Senha incorreta.
- `auth/invalid-email`: Email inválido.

**Conexão com o sistema:**
- Rota pública `/login`.
- Após login, usuário é redirecionado para Home, que mostra Dashboard.

---

### 4. **Cadastro.jsx**

**O que faz:**
- Página de registro para novos usuários.
- Cria conta no Firebase Auth.

**Principais funções:**
- `handleCadastro`: Processa o formulário de cadastro.
- Coleta informações: nome, email, senha, olimpíada preferida.
- Validação de campos.

**Hooks utilizados:**
- `useState`: Gerencia estado do formulário.
- `useNavigate`: Redireciona após cadastro.

**Serviços externos:**
- `authService.registerUser`: Cria conta no Firebase Auth.

**Fluxo de funcionamento:**
1. Usuário preenche formulário (nome, email, senha, olimpíada).
2. Submete o formulário.
3. Chama `registerUser(email, senha)`.
4. Se sucesso → redireciona para `/dashboard`.
5. Se erro → exibe mensagem de erro.

**Tratamento de erros:**
- `auth/email-already-in-use`: Email já cadastrado.
- `auth/weak-password`: Senha muito fraca.
- `auth/invalid-email`: Email inválido.

**Conexão com o sistema:**
- Rota pública `/cadastro`.
- Após cadastro, usuário é autenticado automaticamente e redirecionado.

---

### 5. **Dashboard.jsx**

**O que faz:**
- Página principal para usuários autenticados.
- Exibe cronogramas salvos do usuário.
- Oferece acesso rápido a trilhas e configurações.

**Principais funções:**
- `excluirCronograma`: Remove cronograma do Firestore.
- `carregarCronograma`: Carrega cronograma salvo e navega para visualização.
- `useEffect`: Carrega cronogramas do usuário em tempo real.

**Hooks utilizados:**
- `useState`: Gerencia lista de cronogramas salvos.
- `useEffect`: Monitora mudanças nos cronogramas do Firestore.
- `useNavigate`: Navegação programática.

**Serviços externos:**
- Firebase Firestore: `collection`, `query`, `where`, `onSnapshot`, `deleteDoc`, `doc`.
- Firebase Auth: `auth.currentUser`.

**Fluxo de funcionamento:**
1. Carrega cronogramas do usuário do Firestore em tempo real.
2. Exibe cards com informações de cada cronograma.
3. Permite excluir cronogramas.
4. Permite abrir cronograma para visualização detalhada.
5. Oferece links para criar novo cronograma e acessar trilhas.

**Estrutura de dados:**
- Cronogramas são salvos na coleção `cronogramas` do Firestore.
- Filtrados por `userId` igual ao UID do usuário autenticado.

**Conexão com o sistema:**
- Rota protegida `/dashboard`.
- Acessível apenas para usuários autenticados.
- Integra com páginas de Cronogramas e Trilhas.

---

### 6. **Trilhas.jsx**

**O que faz:**
- Página que lista todas as olimpíadas disponíveis.
- Apresenta cards informativos sobre cada olimpíada (OBMEP, OMIF, OIMSF).

**Principais funções:**
- Exibição de informações sobre cada olimpíada.
- Links para páginas específicas de cada trilha.

**Hooks utilizados:**
- Nenhum hook personalizado.

**Serviços externos:**
- Nenhum serviço externo direto.

**Fluxo de funcionamento:**
1. Renderiza cards informativos sobre cada olimpíada.
2. Cada card contém descrição e link para trilha específica.
3. Usuário clica em "Ver Trilha" para acessar detalhes.

**Conexão com o sistema:**
- Rota protegida `/trilhas`.
- Redireciona para `/trilhas/:id` (ex: `/trilhas/obmep`).

---

### 7. **Trilha.jsx**

**O que faz:**
- Página detalhada de uma trilha específica de olimpíada.
- Carrega matérias do Firestore filtradas por olimpíada.
- Exibe gráfico de importância das matérias.
- Mostra materiais de estudo (sites, vídeos, exercícios, resoluções).

**Principais funções:**
- `buscarMaterias`: Busca matérias do Firestore filtradas por olimpíada.
- `formatarTempo`: Formata tempo de estudo em horas.
- `renderizarLinks`: Renderiza links de materiais de estudo.
- Ordenação por relevância e importância.

**Hooks utilizados:**
- `useState`: Gerencia lista de matérias, loading e erros.
- `useEffect`: Carrega matérias quando o ID da olimpíada muda.
- `useParams`: Obtém ID da olimpíada da URL.

**Serviços externos:**
- Firebase Firestore: `collection`, `getDocs`.
- Recharts: Para gráfico de pizza.

**Fluxo de funcionamento:**
1. Obtém ID da olimpíada da URL (`/trilhas/:id`).
2. Busca todas as matérias da coleção `Materias` no Firestore.
3. Filtra matérias que contêm a olimpíada no array `OLIMPIADAS`.
4. Ordena por relevância específica ou importância geral.
5. Renderiza gráfico de pizza com distribuição de importância.
6. Exibe accordion com matérias e seus materiais de estudo.

**Estrutura de dados (Matérias no Firestore):**
```javascript
{
  nome: "Nome da Matéria",
  OLIMPIADAS: ["OBMEP", "OMIF"], // Array de olimpíadas
  importancia: 8, // 1-10
  relevanciaEspecifica: { OBMEP: 9, OMIF: 7 }, // Importância por olimpíada
  relevancia: "Alta" | "Média" | "Baixa",
  tempo: 10, // Horas estimadas
  SITES: ["url1", "url2"], // Links de material teórico
  VIDEOS: ["url1", "url2"], // Links de videoaulas
  EXERCICIOS: ["url1", "url2"], // Links de exercícios
  RESOLUCOES: ["url1", "url2"] // Links de resoluções
}
```

**Conexão com o sistema:**
- Rota protegida `/trilhas/:id`.
- Integra com página de Cronogramas (matérias são usadas na geração de cronogramas).

---

### 8. **Cronogramas.jsx**

**O que faz:**
- Página para criar e gerenciar cronogramas personalizados.
- Permite configurar olimpíada, datas e horas por semana.
- Gera cronograma automaticamente distribuindo matérias pelas semanas.
- Salva cronograma no Firestore automaticamente.
- Permite exportar cronograma em PDF.

**Principais funções:**
- `gerarCronograma`: Algoritmo principal que gera o cronograma.
- `exportarPDF`: Gera PDF do cronograma usando jsPDF.
- `descartarCronograma`: Remove cronograma do Firestore.
- `carregarCronograma`: Carrega cronograma salvo.
- `calcularProgresso`: Calcula progresso baseado em datas.
- `abrirDetalhesMateria`: Abre dialog com detalhes da matéria.

**Hooks utilizados:**
- `useState`: Gerencia estados do formulário, cronograma gerado, matérias, etc.
- `useEffect`: Carrega matérias do Firestore, monitora cronogramas salvos, carrega cronograma do state de navegação.
- `useNavigate`, `useLocation`: Navegação e acesso ao state.

**Serviços externos:**
- Firebase Firestore: `collection`, `getDocs`, `setDoc`, `deleteDoc`, `query`, `where`, `onSnapshot`.
- Firebase Auth: `auth.currentUser`, `onAuthStateChanged`.
- jsPDF: Geração de PDF.
- date-fns: Manipulação de datas.

**Algoritmo de Geração de Cronograma:**
1. **Validação**: Verifica se todos os campos estão preenchidos.
2. **Cálculo de tempo**: Calcula total de semanas e horas disponíveis.
3. **Filtragem**: Filtra matérias da olimpíada selecionada.
4. **Ordenação**: Ordena por relevância (Alta > Média > Baixa) e depois por importância.
5. **Seleção inteligente**: Seleciona matérias até preencher o total de horas disponíveis.
6. **Distribuição por semanas**: Distribui matérias selecionadas pelas semanas disponíveis, respeitando horas por semana.
7. **Salvamento**: Salva automaticamente no Firestore.

**Fluxo de funcionamento:**
1. Usuário preenche formulário (olimpíada, data início, data prova, horas/semana).
2. Clica em "Gerar Cronograma Personalizado".
3. Sistema gera cronograma e salva automaticamente.
4. Exibe cronograma gerado com semanas e matérias.
5. Usuário pode exportar em PDF ou descartar.

**Estrutura de dados (Cronograma no Firestore):**
```javascript
{
  id: "cronograma_1234567890",
  olimpiada: "OBMEP",
  dataInicio: Timestamp,
  dataProva: Timestamp,
  horasPorSemana: 10,
  semanas: [
    {
      semana: 1,
      dataInicio: Date,
      dataFim: Date,
      materias: [...], // Array de matérias
      totalHoras: 10
    },
    // ...
  ],
  dataCriacao: Timestamp,
  userId: "uid_do_usuario",
  titulo: "OBMEP - 01/01/2024"
}
```

**Conexão com o sistema:**
- Rota protegida `/cronogramas`.
- Integra com Dashboard (cronogramas salvos são exibidos lá).
- Integra com página de visualização de cronograma (`/cronograma`).

---

### 9. **Cronograma.jsx**

**O que faz:**
- Página de visualização detalhada de um cronograma específico.
- Recebe cronograma via state de navegação.
- Exibe semanas, matérias e progresso.
- Permite exportar em PDF.

**Principais funções:**
- `calcularProgresso`: Calcula porcentagem de progresso baseado em datas.
- `exportarPDF`: Gera PDF do cronograma.
- `abrirDetalhesMateria`: Abre dialog com detalhes da matéria.

**Hooks utilizados:**
- `useState`: Gerencia cronograma carregado e matéria selecionada.
- `useEffect`: Carrega cronograma do state de navegação.
- `useLocation`, `useNavigate`: Acesso ao state e navegação.

**Serviços externos:**
- jsPDF: Geração de PDF.
- date-fns: Manipulação de datas.

**Fluxo de funcionamento:**
1. Recebe cronograma via `location.state.cronogramaCarregado`.
2. Se não houver cronograma, redireciona para Dashboard.
3. Exibe informações do cronograma (período, horas, semanas).
4. Mostra barra de progresso.
5. Lista semanas com matérias.
6. Permite exportar em PDF.

**Conexão com o sistema:**
- Rota protegida `/cronograma`.
- Acessada via Dashboard ou página de Cronogramas.
- Recebe dados via state de navegação do React Router.

---

### 10. **Configuracoes.jsx**

**O que faz:**
- Página de configurações do perfil do usuário.
- Permite editar informações pessoais, preferências e segurança.
- Gerencia upload de foto de perfil.
- Permite alterar senha.

**Principais funções:**
- `carregarDados`: Carrega dados do usuário do Firestore.
- `handleFotoUpload`: Faz upload de foto para Firebase Storage.
- `removerFoto`: Remove foto do Storage e perfil.
- `salvarDadosGerais`: Salva alterações no Firestore.
- `alterarSenha`: Altera senha do usuário (requer reautenticação).

**Hooks utilizados:**
- `useState`: Gerencia dados do usuário, loading, mensagens, erros.
- `useEffect`: Carrega dados do usuário ao montar.
- `useRef`: Referência para input de arquivo.

**Serviços externos:**
- Firebase Firestore: `doc`, `getDoc`, `setDoc`, `updateDoc`.
- Firebase Storage: `ref`, `uploadBytes`, `getDownloadURL`, `deleteObject`.
- Firebase Auth: `updateProfile`, `updatePassword`, `reauthenticateWithCredential`, `EmailAuthProvider`.

**Fluxo de funcionamento:**
1. Carrega dados do usuário do Firestore ao montar.
2. Se não existir documento, cria um com dados iniciais.
3. Usuário edita informações.
4. Ao salvar, atualiza Firestore e Auth profile.
5. Para foto: faz upload no Storage, atualiza Firestore e Auth.
6. Para senha: reautentica usuário, depois atualiza senha.

**Estrutura de dados (Usuário no Firestore):**
```javascript
{
  nome: "Nome do Usuário",
  email: "email@exemplo.com",
  bio: "Biografia...",
  escola: "Nome da Escola",
  serie: "1ano",
  foto: "https://...", // URL da foto no Storage
  preferencias: {
    olimpiadaFavorita: "OBMEP",
    nivel: "iniciante",
    notificacoes: true,
    emailMarketing: false
  },
  metas: {
    horasEstudo: 10,
    olimpiadaAlvo: "OBMEP"
  },
  dataCriacao: Timestamp,
  dataAtualizacao: Timestamp
}
```

**Conexão com o sistema:**
- Rota protegida `/configuracoes`.
- Acessível via dropdown do Header.
- Dados são usados em outras partes da aplicação (ex: Header mostra nome do usuário).

---

### 11. **QuemSomos.jsx**

**O que faz:**
- Página informativa sobre o projeto e equipe.
- Apresenta missão, visão e valores.

**Principais funções:**
- Exibição de informações estáticas sobre o projeto.

**Hooks utilizados:**
- Nenhum hook personalizado.

**Serviços externos:**
- Nenhum serviço externo.

**Fluxo de funcionamento:**
1. Renderiza informações sobre o projeto.
2. Apresenta missão, visão e valores.

**Conexão com o sistema:**
- Rota pública `/quemsomos`.
- Acessível via Header.

---

## 🧩 Explicação dos Componentes

### **Header.jsx**

**Objetivo:**
- Componente de navegação principal da aplicação.
- Exibe logo, menu de navegação, toggle de tema e área de autenticação.

**Props recebidas:**
- Nenhuma prop (usa hooks para obter dados).

**Eventos tratados:**
- `toggleDropdown`: Abre/fecha dropdown do usuário.
- `handleLogout`: Faz logout do usuário.
- Cliques em links de navegação.

**Interações com a UI:**
- Mostra diferentes opções para usuários logados vs não logados.
- Dropdown com opções de configurações e logout.
- Logo redireciona para Home (que decide o que mostrar).

**Hooks utilizados:**
- `useAuth`: Obtém estado de autenticação.
- `useState`: Gerencia estado do dropdown.
- `useEffect`: Carrega dados do usuário do Firestore.
- `useRef`: Referências para elementos do dropdown.

**Serviços utilizados:**
- Firebase Auth: `signOut`.
- Firebase Firestore: `doc`, `getDoc`, `setDoc`.

---

### **PrivateRoute.jsx**

**Objetivo:**
- Componente de proteção de rotas.
- Garante que apenas usuários autenticados acessem rotas protegidas.

**Props recebidas:**
- `children`: Componente filho a ser renderizado se autenticado.

**Eventos tratados:**
- Nenhum evento direto.

**Interações com a UI:**
- Se loading → mostra spinner.
- Se autenticado → renderiza children.
- Se não autenticado → redireciona para `/login`.

**Hooks utilizados:**
- `useAuth`: Verifica autenticação.

**Uso no sistema:**
- Envolve rotas protegidas em `main.jsx`:
  ```jsx
  <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
  ```

---

### **ThemeToggle.jsx**

**Objetivo:**
- Componente para alternar entre tema claro e escuro.

**Props recebidas:**
- Nenhuma prop.

**Eventos tratados:**
- `toggleTheme`: Alterna entre light e dark.

**Interações com a UI:**
- Botão com ícone de sol/lua.
- Atualiza classe `dark` no elemento raiz do HTML.
- Salva preferência no localStorage.

**Hooks utilizados:**
- `useState`: Gerencia tema atual.
- `useEffect`: Aplica tema ao DOM e salva no localStorage.

**Funcionamento:**
1. Carrega tema do localStorage ou usa preferência do sistema.
2. Aplica classe `dark` ou `light` no `<html>`.
3. Salva preferência no localStorage.
4. Tailwind CSS aplica estilos baseados na classe.

---

### **Componentes UI (shadcn/ui)**

Componentes baseados em Radix UI e estilizados com Tailwind CSS:

- **Button**: Botões com variantes (default, outline, destructive, etc.).
- **Card**: Cards para exibir conteúdo.
- **Input**: Campos de entrada de texto.
- **Label**: Labels para formulários.
- **Dialog**: Modais/dialogs.
- **Select**: Seletores dropdown.
- **Calendar**: Calendário para seleção de datas.
- **Popover**: Popovers para conteúdo flutuante.
- **Badge**: Badges para tags e indicadores.
- **Avatar**: Avatar de usuário.
- **Switch**: Toggle switches.
- **Textarea**: Área de texto.
- **Accordion**: Accordion para conteúdo expansível.
- **NavigationMenu**: Menu de navegação.

Todos seguem o design system do projeto e suportam tema claro/escuro.

---

## 🎣 Hooks Personalizados

### **useAuth.js**

**O que abstrai:**
- Estado de autenticação do Firebase Auth.
- Loading state durante verificação.

**Como funciona internamente:**
1. Usa `useState` para gerenciar `user` e `loading`.
2. Usa `useEffect` para escutar mudanças no estado de autenticação via `onAuthStateChanged`.
3. Retorna `{ user, loading }`.

**Em quais páginas/componentes é utilizado:**
- `Home.jsx`: Decide qual página mostrar.
- `Header.jsx`: Mostra opções diferentes para usuários logados.
- `PrivateRoute.jsx`: Protege rotas.

**Vantagens:**
- Centraliza lógica de autenticação.
- Evita repetição de código.
- Fornece loading state para evitar flashes de conteúdo.

---

### **use-mobile.js**

**O que abstrai:**
- Detecção de dispositivos móveis baseada em largura da tela.

**Como funciona internamente:**
1. Usa `window.matchMedia` para detectar largura < 768px.
2. Escuta mudanças no tamanho da janela.
3. Retorna boolean indicando se é mobile.

**Em quais páginas/componentes é utilizado:**
- Potencialmente usado em componentes responsivos (não encontrado uso direto no código analisado, mas disponível).

**Breakpoint:**
- 768px (padrão comum para mobile/desktop).

---

## 🔧 Serviços

### **firebaseConfig.js**

**Responsabilidade:**
- Configuração e inicialização do Firebase.
- Exporta instâncias de Auth, Firestore e Storage.

**Como é usado no projeto:**
- Importado em todos os arquivos que precisam acessar Firebase.
- Fornece `auth`, `db` e `storage` para uso em toda a aplicação.

**Funções exportadas:**
- `auth`: Instância do Firebase Auth.
- `db`: Instância do Firestore.
- `storage`: Instância do Firebase Storage.

**Configuração:**
- Contém credenciais do projeto Firebase (apiKey, authDomain, projectId, etc.).
- Inicializa app com `initializeApp`.
- Exporta serviços configurados.

---

### **authService.js**

**Responsabilidade:**
- Abstrai operações de autenticação do Firebase Auth.
- Fornece funções simples para registro, login e logout.

**Como é usado no projeto:**
- Importado em páginas de Login e Cadastro.
- Usado para autenticar usuários.

**Funções exportadas:**
- `registerUser(email, password)`: Cria nova conta.
- `loginUser(email, password)`: Autentica usuário existente.
- `logoutUser()`: Faz logout do usuário.

**Vantagens:**
- Centraliza lógica de autenticação.
- Facilita manutenção e testes.
- Abstrai complexidade do Firebase Auth.

---

## 🔄 Lógica Geral do Projeto

### **Navegação**

**Sistema de Rotas:**
- Usa React Router v7 (`react-router-dom`).
- Rotas definidas em `main.jsx`.

**Rotas Públicas:**
- `/`: Home (inteligente - mostra LandingPage ou Dashboard).
- `/login`: Página de login.
- `/cadastro`: Página de cadastro.
- `/quemsomos`: Sobre o projeto.

**Rotas Protegidas (envolvidas por PrivateRoute):**
- `/dashboard`: Dashboard do usuário.
- `/trilhas`: Lista de trilhas.
- `/trilhas/:id`: Trilha específica.
- `/cronogramas`: Criar cronogramas.
- `/cronograma`: Visualizar cronograma.
- `/configuracoes`: Configurações do perfil.

**Navegação Inteligente:**
- Home (`/`) decide automaticamente o que mostrar baseado em autenticação.
- Após login, usuário é redirecionado para `/` (que mostra Dashboard).
- Rotas protegidas redirecionam para `/login` se não autenticado.

---

### **Autenticação**

**Fluxo de Autenticação:**
1. Usuário acessa `/login` ou `/cadastro`.
2. Preenche formulário e submete.
3. `authService` chama Firebase Auth.
4. Se sucesso, usuário é autenticado.
5. `useAuth` detecta mudança e atualiza estado.
6. Usuário é redirecionado para `/` (Home mostra Dashboard).

**Persistência:**
- Firebase Auth mantém sessão automaticamente.
- `onAuthStateChanged` detecta mudanças em tempo real.
- Sessão persiste entre recarregamentos da página.

**Proteção de Rotas:**
- `PrivateRoute` verifica autenticação antes de renderizar.
- Se não autenticado, redireciona para `/login`.

---

### **Carregamento de Dados do Firebase**

**Firestore:**
- **Matérias**: Carregadas em `Trilha.jsx` e `Cronogramas.jsx` da coleção `Materias`.
- **Cronogramas**: Carregados em `Dashboard.jsx` e `Cronogramas.jsx` da coleção `cronogramas`, filtrados por `userId`.
- **Usuários**: Carregados em `Configuracoes.jsx` e `Header.jsx` da coleção `usuarios`.

**Tempo Real:**
- `onSnapshot` é usado para atualizações em tempo real (ex: cronogramas no Dashboard).
- Dados são atualizados automaticamente quando há mudanças no Firestore.

**Storage:**
- Fotos de perfil são armazenadas em `profile-pictures/{userId}/{filename}`.
- URLs são salvas no Firestore e no Auth profile.

---

### **Geração de Cronogramas**

**Algoritmo:**
1. **Entrada**: Olimpíada, data início, data prova, horas por semana.
2. **Cálculo**: Total de semanas e horas disponíveis.
3. **Filtragem**: Matérias da olimpíada selecionada.
4. **Ordenação**: Por relevância (Alta > Média > Baixa) e importância.
5. **Seleção**: Seleciona matérias até preencher horas disponíveis.
6. **Distribuição**: Distribui matérias pelas semanas, respeitando horas por semana.
7. **Salvamento**: Salva automaticamente no Firestore.

**Inteligência:**
- Prioriza matérias mais importantes.
- Ajusta tempo de matérias se necessário para caber no período.
- Divide matérias entre semanas se não couberem em uma.

---

### **Sistema de Temas (Claro/Escuro)**

**Implementação:**
- `ThemeToggle` gerencia estado do tema.
- Tema salvo no `localStorage`.
- Classe `dark` aplicada no elemento `<html>`.
- Tailwind CSS aplica estilos baseados na classe.

**Suporte:**
- Todos os componentes UI suportam tema escuro.
- Cores definidas em `index.css` com variáveis CSS.
- Preferência do sistema é usada como padrão inicial.

---

### **Rotas Privadas (PrivateRoute)**

**Funcionamento:**
1. `PrivateRoute` usa `useAuth` para verificar autenticação.
2. Se `loading` → mostra spinner.
3. Se `user` existe → renderiza children.
4. Se não autenticado → redireciona para `/login`.

**Uso:**
- Envolve todas as rotas que requerem autenticação.
- Evita acesso não autorizado a páginas protegidas.

---

## 📊 Estrutura de Dados no Firestore

### **Coleção: `Materias`**
```javascript
{
  nome: string,
  OLIMPIADAS: string[], // ["OBMEP", "OMIF"]
  importancia: number, // 1-10
  relevanciaEspecifica: { OBMEP: number, OMIF: number },
  relevancia: "Alta" | "Média" | "Baixa",
  tempo: number, // Horas estimadas
  SITES: string[], // URLs de material teórico
  VIDEOS: string[], // URLs de videoaulas
  EXERCICIOS: string[], // URLs de exercícios
  RESOLUCOES: string[] // URLs de resoluções
}
```

### **Coleção: `cronogramas`**
```javascript
{
  id: string,
  olimpiada: string,
  dataInicio: Timestamp,
  dataProva: Timestamp,
  horasPorSemana: number,
  semanas: [
    {
      semana: number,
      dataInicio: Date,
      dataFim: Date,
      materias: Materia[],
      totalHoras: number
    }
  ],
  dataCriacao: Timestamp,
  userId: string,
  titulo: string
}
```

### **Coleção: `usuarios`**
```javascript
{
  nome: string,
  email: string,
  bio: string,
  escola: string,
  serie: string,
  foto: string, // URL do Storage
  preferencias: {
    olimpiadaFavorita: string,
    nivel: "iniciante" | "intermediario" | "avancado",
    notificacoes: boolean,
    emailMarketing: boolean
  },
  metas: {
    horasEstudo: number,
    olimpiadaAlvo: string
  },
  dataCriacao: Timestamp,
  dataAtualizacao: Timestamp
}
```

---

## 🎨 Tecnologias e Bibliotecas

- **React 19**: Framework principal.
- **Vite**: Build tool e dev server.
- **React Router v7**: Roteamento.
- **Firebase**: Auth, Firestore, Storage.
- **Tailwind CSS v4**: Estilização.
- **shadcn/ui**: Componentes UI baseados em Radix UI.
- **date-fns**: Manipulação de datas.
- **jsPDF**: Geração de PDFs.
- **Recharts**: Gráficos (gráfico de pizza em Trilha).
- **Lucide React**: Ícones.

---

## 🔐 Segurança

- Rotas protegidas com `PrivateRoute`.
- Autenticação via Firebase Auth.
- Regras de segurança do Firestore (devem ser configuradas no Firebase Console).
- Reautenticação necessária para alterar senha.
- Validação de formulários no cliente.

---

## 📝 Notas Importantes

1. **Home Inteligente**: A rota `/` decide automaticamente o que mostrar baseado em autenticação.
2. **Salvamento Automático**: Cronogramas são salvos automaticamente ao serem gerados.
3. **Tempo Real**: Cronogramas no Dashboard são atualizados em tempo real via `onSnapshot`.
4. **State de Navegação**: Cronogramas são passados entre páginas via `location.state`.
5. **Fallback de Dados**: Sistema cria documentos de usuário automaticamente se não existirem.
6. **Tratamento de Erros**: Todas as operações Firebase têm tratamento de erros específico.

---

## 🚀 Melhorias Futuras Sugeridas

1. Implementar regras de segurança do Firestore mais robustas.
2. Adicionar validação de formulários mais completa.
3. Implementar cache de dados do Firestore.
4. Adicionar testes unitários e de integração.
5. Implementar sistema de notificações.
6. Adicionar analytics de uso.
7. Implementar sistema de favoritos para matérias.
8. Adicionar busca e filtros nas trilhas.

