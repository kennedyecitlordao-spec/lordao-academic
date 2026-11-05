# Lordão Academic — Front-end

Protótipo funcional do **Lordão Academic**, portal acadêmico da **ECIT Professor Lordão** (Bayeux · Paraíba).
Interface responsiva, mobile-first, em português, construída a partir da identidade visual entregue em
`identidade_visual/` e dos requisitos das duas versões do SRS (`lordaoacademic_SRS_Enxuta.docx` e
`Lordão Academic-srs-projeto-escolar.docx`).

> **Escopo atual: apenas front-end.** Não há back-end. Todos os dados são mocks locais e o login é
> simulado. Alterações feitas na demonstração (atividades, notas, turmas, usuários e notícias) ficam
> salvas no `localStorage` do navegador. A integração com servidor/banco só começa depois da aprovação
> do front-end.

---

## Como rodar

Não há build, dependências ou `npm install`. É HTML/CSS/JS puro.

**Opção 1 — servidor local (recomendado)**

```bash
python -m http.server 4173
```

Depois abra <http://localhost:4173>.

**Opção 2 — abrir o arquivo direto**

Abra `index.html` no navegador. Funciona, mas alguns navegadores restringem `localStorage` em
`file://`; prefira a opção 1.

O projeto também pode ser publicado em qualquer hospedagem estática (GitHub Pages, Netlify, Vercel).

---

## Entrar na demonstração

Na tela de acesso escolha o **perfil** (Aluno, Professor ou Secretaria) e informe **qualquer usuário e
qualquer senha** — não há validação de credencial porque não existe back-end. A sessão fica guardada em
`localStorage`.

Perfis disponíveis:

| Perfil      | Usuário de demonstração       | Contexto                                  |
| ----------- | ----------------------------- | ----------------------------------------- |
| Aluno       | Maria Clara Nunes (2º B)      | Agenda, atividades, notas e frequência     |
| Professor   | Pedro Almeida (Matemática)    | Turmas, publicação de atividades, diário  |
| Secretaria  | Ana Beatriz Lima              | Turmas, usuários e notícias da escola     |

---

## O que já está implementado

### Funcionalidades do SRS (front-end)

- **RF01 — Acesso e cadastro**: login por perfil, tela "criar minha conta" (solicitação de acesso
  liberada pela secretaria) e recuperação de senha.
- **RF02 — Pendências do aluno**: agenda semanal com aulas, avaliações e intervalos; lista de atividades
  com filtros (todas / pendentes / entregues / em atraso), prazo, valor e professor; entrega de atividade
  com anexo e comentário; boletim por disciplina com média, frequência e situação.
- **RF03 — Ações do professor**: visão geral do dia, minhas turmas, publicação de atividades com prazo,
  valor e formato, acompanhamento de entregas e diário de classe com lançamento de notas (1º–4º
  bimestre + média + situação) e registro de frequência (P / F / J). Atividades publicadas para o 2º B
  aparecem imediatamente para a aluna de demonstração, e as notas lançadas no diário sincronizam com o
  boletim.
- **RF04 — Secretaria**: painel da escola com totais dinâmicos, cadastro de turmas, gestão de logins
  (perfil, status de ativação) e gestão de notícias (publicar, editar, rascunho, excluir). Solicitações
  do cadastro entram como pendentes para ativação, e uma notícia publicada passa a aparecer no feed do
  aluno.

### Requisitos não funcionais

- **RNF01 — Temas**: tema escuro (padrão) e claro, alternáveis em qualquer tela, com preferência
  persistida em `localStorage`.
- **RNF02 — Resposta rápida**: SPA sem recarregamentos, roteamento por hash, dados em memória com
  persistência local (`lordao.data.v1`) e transições curtas.
- **RNF03 — Permissões por perfil**: cada perfil enxerga apenas o seu menu e as suas ações (interface
  pronta para receber as regras do back-end).

### Interface

- Layout mobile-first: barra inferior de navegação no celular, menu lateral no desktop.
- Modais em folha (bottom sheet) no celular e centralizados no desktop.
- Toasts, estados vazios, campos obrigatórios com validação e foco automático no primeiro campo inválido.
- Acessibilidade: navegação por teclado, `aria-*` nos componentes, link "pular para o conteúdo",
  contraste conferido nos dois temas e respeito a `prefers-reduced-motion`.

---

## Identidade visual

| Elemento            | Valor                                                      |
| ------------------- | ---------------------------------------------------------- |
| Azul marinho        | `#182B5C` — cor primária da marca                           |
| Lilás               | `#7469BC` — cor de apoio e destaque                         |
| Azul acinzentado   | `#9AB5C1` — apoio e ilustrações                             |
| Creme               | `#FFFEF4` — fundo claro e textos sobre as áreas escuras     |
| Fundo escuro        | `#0A1624` — tema escuro da aplicação                        |
| Tipografia          | Raleway (interface) e Instrument Serif (títulos e tagline)  |

O logotipo (livro aberto + monograma **L+A**) foi redesenhado em SVG original para a aplicação —
`assets/img/favicon.svg` e o bloco `<svg>` de `assets/js/icons.js`.

---

## Estrutura

```
index.html                 página única da aplicação
assets/css/main.css        design system, componentes e responsividade
assets/js/icons.js         ícones em SVG inline e marca do logotipo
assets/js/data.js          dados de demonstração (usuários, turmas, notas, notícias…)
assets/js/app.js           roteamento, telas, modais, eventos e estado
assets/img/favicon.svg     ícone da aplicação
identidade_visual/         materiais de marca recebidos (referência)
```

---

## Próximos passos (back-end)

1. API de autenticação com os perfis aluno, professor e secretaria e senha provisória.
2. Persistência de usuários, turmas, atividades, notas, frequência e notícias.
3. Regra de notificação de responsáveis sobre notas e frequência (ponto levantado no SRS).
4. Upload real de arquivos (materiais e entregas) e geração de boletim em PDF.
5. Autorização por perfil no servidor, espelhando o que já existe na interface.
