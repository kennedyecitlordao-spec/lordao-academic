/* ==========================================================================
   Lordão Academic — aplicação front-end (dados simulados, sem back-end)
   ========================================================================== */
(function () {
  'use strict';

  var D = window.LordaoData;
  var I = window.LordaoIcons;
  var icon = I.icon;
  var logo = I.logo;

  var app = document.getElementById('app');
  var modalRoot = document.getElementById('modal-root');
  var toastRoot = document.getElementById('toast-root');

  var SUBJECTS = D.subjects;
  var STORE = { theme: 'lordao.theme', session: 'lordao.session', prefs: 'lordao.prefs', data: 'lordao.data.v1' };

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function readStorage(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function copyList(list) {
    return list.map(function (item) { return Object.assign({}, item); });
  }

  function defaultData() {
    return {
      activities: copyList(D.activities),
      notifications: {
        aluno: copyList(D.notifications),
        professor: copyList(D.teacherNotifications),
        secretaria: copyList(D.secretaryNotifications)
      },
      news: copyList(D.news),
      managedNews: copyList(D.secretary.newsManaged),
      accounts: copyList(D.secretary.accounts),
      classes: copyList(D.secretary.classes),
      published: copyList(D.teacher.published),
      students: clone(D.teacher.students),
      grades: clone(D.grades),
      attendance: {}
    };
  }

  var seed = defaultData();
  var saved = readJSON(STORE.data, null);
  if (!saved || saved.v !== 1) saved = null;

  function persisted(key, fallback) {
    return saved && saved[key] != null ? saved[key] : fallback;
  }

  var state = {
    theme: readStorage(STORE.theme, 'dark'),
    session: readJSON(STORE.session, null),
    route: 'inicio',
    loginRole: 'aluno',
    day: 'qui',
    newsIndex: 0,
    activityFilter: 'todas',
    noticeFilter: 'todas',
    teacherFilter: 'todas',
    diaryClass: '2b',
    diaryTab: 'notas',
    attendance: persisted('attendance', seed.attendance),
    prefs: readJSON(STORE.prefs, { activities: true, grades: true, email: false }),
    confirmAction: null,
    lastFocus: null,
    activities: persisted('activities', seed.activities),
    notifications: persisted('notifications', seed.notifications),
    news: persisted('news', seed.news),
    managedNews: persisted('managedNews', seed.managedNews),
    accounts: persisted('accounts', seed.accounts),
    classes: persisted('classes', seed.classes),
    published: persisted('published', seed.published),
    students: persisted('students', seed.students),
    grades: persisted('grades', seed.grades)
  };

  function persistData() {
    try {
      localStorage.setItem(STORE.data, JSON.stringify({
        v: 1,
        activities: state.activities,
        notifications: state.notifications,
        news: state.news,
        managedNews: state.managedNews,
        accounts: state.accounts,
        classes: state.classes,
        published: state.published,
        students: state.students,
        grades: state.grades,
        attendance: state.attendance
      }));
    } catch (e) { /* modo demonstração sem armazenamento */ }
  }

  if (!state.session || !D.users[state.session.role]) state.session = null;

  /* ---------- Helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function initials(name) {
    var parts = String(name || '').replace(/^(Prof\.|Profª|Dra?\.)\s*/i, '').trim().split(/\s+/);
    if (!parts.length) return 'LA';
    var first = parts[0].charAt(0);
    var last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
  }

  function avatar(name, extra) {
    return '<span class="avatar ' + (extra || '') + '" aria-hidden="true">' + esc(initials(name)) + '</span>';
  }

  function fmtNum(n) {
    return Number(n).toFixed(1).replace('.', ',');
  }

  function subject(key) {
    return SUBJECTS[key] || { name: key || 'Disciplina', color: '#8C81D9' };
  }

  function subjectDot(key) {
    return '<span class="subject-dot" style="background:' + subject(key).color + '"></span>';
  }

  function notificationsFor(role) {
    var groups = state.notifications || {};
    return groups[role] || [];
  }

  function currentNotifications() {
    return notificationsFor(state.session ? state.session.role : 'aluno');
  }

  function unreadCount() {
    return currentNotifications().filter(function (n) { return n.unread; }).length;
  }

  function pendingCount() {
    return state.activities.filter(function (a) { return a.status === 'pendente' || a.status === 'atrasada'; }).length;
  }

  function greeting() {
    var h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  function capitalize(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
  }

  function todayLong() {
    return capitalize(new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }));
  }

  function todayKey() {
    return ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][new Date().getDay()];
  }

  function nowMinutes() {
    var d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }

  function toMinutes(hhmm) {
    var p = hhmm.split(':');
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function subjectAverage(g) {
    var values = [g.b1, g.b2, g.b3, g.b4].filter(function (v) { return v !== null && v !== undefined && v !== ''; });
    if (!values.length) return 0;
    return values.reduce(function (a, b) { return a + b; }, 0) / values.length;
  }

  function gradeTone(value) {
    if (value >= 8) return 'high';
    if (value >= 6) return 'mid';
    return 'low';
  }

  function studentStats() {
    var grades = state.grades || [];
    var averages = grades.map(subjectAverage);
    var avg = averages.length ? averages.reduce(function (a, b) { return a + b; }, 0) / averages.length : 0;
    var freq = grades.length ? grades.reduce(function (a, g) { return a + g.freq; }, 0) / grades.length : 0;
    var entregues = state.activities.filter(function (a) { return a.status === 'entregue'; }).length;
    return {
      avg: avg,
      freq: freq,
      pending: pendingCount(),
      late: state.activities.filter(function (a) { return a.status === 'atrasada'; }).length,
      done: entregues,
      total: state.activities.length
    };
  }

  function currentUser() { return D.users[state.session.role]; }

  function route() {
    var raw = (location.hash || '').replace(/^#\/?/, '').trim();
    return raw || 'inicio';
  }

  function navigate(target) {
    if (location.hash === '#/' + target) {
      state.route = target;
      renderApp();
    } else {
      location.hash = '#/' + target;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- Theme ---------- */
  function applyTheme(theme) {
    state.theme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    try { localStorage.setItem(STORE.theme, state.theme); } catch (e) { /* armazenamento indisponível */ }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', state.theme === 'dark' ? '#0A1522' : '#F4F0E6');
    $$('.js-theme-toggle').forEach(function (btn) {
      btn.innerHTML = icon(state.theme === 'dark' ? 'sun' : 'moon');
      btn.setAttribute('aria-label', state.theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
      btn.setAttribute('title', state.theme === 'dark' ? 'Tema claro' : 'Tema escuro');
    });
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  /* ---------- Toasts ---------- */
  function toast(title, text, tone) {
    var t = tone || 'success';
    var iconName = t === 'error' ? 'alert' : (t === 'info' ? 'info' : 'check-circle');
    var node = document.createElement('div');
    node.className = 'toast toast--' + t;
    node.setAttribute('role', 'status');
    node.innerHTML =
      '<span class="toast__icon">' + icon(iconName) + '</span>' +
      '<div class="toast__body"><div class="toast__title">' + esc(title) + '</div>' +
      (text ? '<div class="toast__text">' + esc(text) + '</div>' : '') + '</div>';
    toastRoot.appendChild(node);
    setTimeout(function () {
      node.classList.add('is-out');
      setTimeout(function () { node.remove(); }, 240);
    }, 3800);
  }

  /* ---------- Modal ---------- */
  function modalShell(opts) {
    var o = Object.assign({ wide: false, form: '', body: '', foot: '', eyebrow: '', sub: '' }, opts);
    var tag = o.form ? 'form' : 'div';
    var attrs = o.form ? ' data-form="' + o.form + '" novalidate' : ' role="dialog" aria-modal="true"';
    var label = o.form ? ' aria-labelledby="modal-title"' : '';
    return '<div class="modal" data-modal-overlay>' +
      '<' + tag + ' class="modal__dialog' + (o.wide ? ' modal__dialog--wide' : '') + '"' + attrs + label + '>' +
        '<div class="modal__head">' +
          '<div><p class="modal__eyebrow">' + esc(o.eyebrow || 'Lordão Academic') + '</p>' +
          '<h2 class="modal__title" id="modal-title">' + esc(o.title) + '</h2>' +
          (o.sub ? '<p class="modal__sub">' + esc(o.sub) + '</p>' : '') + '</div>' +
          '<button type="button" class="icon-btn icon-btn--ghost modal__close" data-action="close-modal" aria-label="Fechar">' + icon('x') + '</button>' +
        '</div>' +
        '<div class="modal__body">' + o.body + '</div>' +
        (o.foot ? '<div class="modal__foot' + (o.footSplit ? ' modal__foot--split' : '') + '">' + o.foot + '</div>' : '') +
      '</' + tag + '>' +
    '</div>';
  }

  function openModal(html) {
    state.lastFocus = document.activeElement;
    modalRoot.innerHTML = '<div class="modal-root">' + html + '</div>';
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var modal = $('.modal__dialog');
      if (!modal) return;
      var target = modal.querySelector('input:not([type="hidden"]):not([disabled]), select, textarea, button:not([data-action="close-modal"])');
      if (!target) target = modal.querySelector('[data-action="close-modal"]');
      if (target) target.focus();
    }, 40);
  }

  function closeModal() {
    modalRoot.innerHTML = '';
    document.body.style.overflow = '';
    state.confirmAction = null;
    if (state.lastFocus && state.lastFocus.focus) {
      try { state.lastFocus.focus(); } catch (e) { /* noop */ }
    }
  }

  function confirmDialog(title, text, confirmLabel, onConfirm) {
    state.confirmAction = onConfirm;
    openModal(modalShell({
      title: title,
      eyebrow: 'Confirmação',
      body: '<p class="detail-text">' + esc(text) + '</p>',
      foot: '<button type="button" class="btn btn--outline" data-action="close-modal">Cancelar</button>' +
            '<button type="button" class="btn btn--danger" data-action="confirm-action">' + esc(confirmLabel || 'Confirmar') + '</button>'
    }));
  }

  /* ---------- Navigation model ---------- */
  function navModel(role) {
    var unread = unreadCount();
    var pending = pendingCount();
    var models = {
      aluno: {
        main: [
          { route: 'inicio', label: 'Início', short: 'Início', icon: 'home' },
          { route: 'agenda', label: 'Agenda', short: 'Agenda', icon: 'calendar' },
          { route: 'atividades', label: 'Atividades', short: 'Atividades', icon: 'tasks', count: pending },
          { route: 'notas', label: 'Notas', short: 'Notas', icon: 'chart' }
        ]
      },
      professor: {
        main: [
          { route: 'inicio', label: 'Início', short: 'Início', icon: 'home' },
          { route: 'turmas', label: 'Minhas turmas', short: 'Turmas', icon: 'users' },
          { route: 'lancamentos', label: 'Atividades', short: 'Atividades', icon: 'clipboard' },
          { route: 'diario', label: 'Diário de classe', short: 'Diário', icon: 'edit' }
        ]
      },
      secretaria: {
        main: [
          { route: 'inicio', label: 'Visão geral', short: 'Início', icon: 'home' },
          { route: 'turmas', label: 'Turmas', short: 'Turmas', icon: 'users' },
          { route: 'usuarios', label: 'Usuários', short: 'Usuários', icon: 'id-card' },
          { route: 'noticias', label: 'Notícias', short: 'Notícias', icon: 'megaphone' }
        ]
      }
    };
    var model = models[role] || models.aluno;
    model.account = [
      { route: 'notificacoes', label: 'Notificações', short: 'Avisos', icon: 'bell', count: unread },
      { route: 'perfil', label: 'Perfil e ajustes', short: 'Perfil', icon: 'user' }
    ];
    return model;
  }

  function pageMeta(role, currentRoute) {
    var map = {
      'aluno:inicio': { eyebrow: todayLong(), title: 'Meu dia', sub: 'Aqui está o resumo do seu dia na ECIT Professor Lordão.' },
      'aluno:agenda': { eyebrow: 'Sua semana', title: 'Agenda', sub: 'Aulas, avaliações e compromissos do 2º B.' },
      'aluno:atividades': { eyebrow: '2º B · 2º bimestre', title: 'Atividades', sub: 'Acompanhe prazos, entregas e correções.' },
      'aluno:notas': { eyebrow: 'Boletim 2026', title: 'Notas e frequência', sub: 'Seu desempenho por disciplina, bimestre a bimestre.' },
      'professor:inicio': { eyebrow: todayLong(), title: 'Meu dia', sub: 'Quatro aulas hoje e doze entregas aguardando correção.' },
      'professor:turmas': { eyebrow: 'Acompanhamento', title: 'Minhas turmas', sub: 'Estudantes, desempenho e próximos encontros.' },
      'professor:lancamentos': { eyebrow: '2º bimestre', title: 'Atividades', sub: 'Publique tarefas, acompanhe entregas e corrija.' },
      'professor:diario': { eyebrow: 'Registro pedagógico', title: 'Diário de classe', sub: 'Lance notas e registre a frequência da turma.' },
      'secretaria:inicio': { eyebrow: 'Secretaria escolar', title: 'Visão geral', sub: 'Um panorama da ECIT Professor Lordão em tempo real.' },
      'secretaria:turmas': { eyebrow: 'Organização acadêmica', title: 'Turmas', sub: 'Distribuição de estudantes, turnos e responsáveis.' },
      'secretaria:usuarios': { eyebrow: 'Gestão de acessos', title: 'Usuários', sub: 'Crie e acompanhe os logins de alunos e professores.' },
      'secretaria:noticias': { eyebrow: 'Comunicação', title: 'Notícias', sub: 'Publique comunicados para toda a comunidade escolar.' },
      'common:notificacoes': { eyebrow: 'Central de avisos', title: 'Notificações', sub: 'Tudo o que precisa da sua atenção, em um só lugar.' },
      'common:perfil': { eyebrow: 'Sua conta', title: 'Perfil e ajustes', sub: 'Preferências, aparência e segurança do acesso.' }
    };
    if (map[role + ':' + currentRoute]) return map[role + ':' + currentRoute];
    return map['common:' + currentRoute] || { eyebrow: 'Lordão Academic', title: 'Início', sub: 'Conforto e acolhimento para aprender.' };
  }

  /* ---------- Auth view ---------- */
  function renderAuth() {
    document.body.classList.add('is-auth');
    app.innerHTML =
      '<div class="auth">' +
        '<section class="auth__brand" aria-label="Lordão Academic">' +
          '<div class="auth__brand-top">' +
            logo({ className: 'brand brand--light brand--lg', tagline: false }) +
          '</div>' +
          '<div class="auth__brand-body">' +
            '<p class="auth__eyebrow">ECIT Professor Lordão · 2026</p>' +
            '<h1 class="auth__title">Conforto e<br>acolhimento para <em>aprender</em>.</h1>' +
            '<p class="auth__lead">Aulas, atividades, notas e notícias da escola em um só lugar. Um espaço feito para alunos, professores e famílias caminharem juntos.</p>' +
            '<div class="auth__features">' +
              '<div class="auth__feature"><span class="auth__feature-icon">' + icon('tasks') + '</span>Atividades e prazos sempre organizados</div>' +
              '<div class="auth__feature"><span class="auth__feature-icon">' + icon('chart') + '</span>Notas e frequência à mão, a qualquer hora</div>' +
              '<div class="auth__feature"><span class="auth__feature-icon">' + icon('megaphone') + '</span>Notícias e avisos direto da escola</div>' +
            '</div>' +
          '</div>' +
          '<div class="auth__brand-foot"><span>ECIT Professor Lordão</span><span>Bayeux · Paraíba</span></div>' +
          '<div class="auth__book" aria-hidden="true">' + icon('book', '', 560) + '</div>' +
        '</section>' +

        '<section class="auth__panel">' +
          '<button type="button" class="icon-btn icon-btn--ghost auth__theme js-theme-toggle" data-action="toggle-theme" aria-label="Alternar tema"></button>' +
          '<div class="auth__panel-inner">' +
            '<div class="auth__mobile-brand">' +
              logo({ tagline: false }) +
              '<h2 class="auth__title">Conforto e acolhimento para <em>aprender</em>.</h2>' +
              '<p class="auth__lead">Acesse suas aulas, atividades e notas.</p>' +
            '</div>' +
            '<h1 class="auth__heading">Bem-vindo de volta</h1>' +
            '<p class="auth__sub">Escolha seu perfil e entre com os dados fornecidos pela secretaria.</p>' +

            '<div class="role-tabs" role="tablist" aria-label="Tipo de acesso">' +
              '<button type="button" class="role-tab" role="tab" data-action="login-role" data-role="aluno" aria-selected="' + (state.loginRole === 'aluno') + '">Aluno</button>' +
              '<button type="button" class="role-tab" role="tab" data-action="login-role" data-role="professor" aria-selected="' + (state.loginRole === 'professor') + '">Professor</button>' +
              '<button type="button" class="role-tab" role="tab" data-action="login-role" data-role="secretaria" aria-selected="' + (state.loginRole === 'secretaria') + '">Secretaria</button>' +
            '</div>' +

            '<form class="auth-form" data-form="login" novalidate>' +
              '<div class="form-message" id="login-error" role="alert">' + icon('alert') + '<span></span></div>' +
              '<div class="field">' +
                '<label class="field__label" for="login-user">Usuário</label>' +
                '<div class="input-wrap">' + icon('user') +
                  '<input class="input" id="login-user" name="usuario" type="text" autocomplete="username" placeholder="Seu login ou matrícula" required />' +
                '</div>' +
              '</div>' +
              '<div class="field">' +
                '<label class="field__label" for="login-pass">Senha</label>' +
                '<div class="input-wrap input-wrap--action">' + icon('lock') +
                  '<input class="input" id="login-pass" name="senha" type="password" autocomplete="current-password" placeholder="Sua senha" required />' +
                  '<button type="button" class="input-action" data-action="toggle-password" data-target="login-pass" aria-label="Mostrar senha">' + icon('eye') + '</button>' +
                '</div>' +
              '</div>' +
              '<div class="auth-form__row">' +
                '<label class="checkbox"><input type="checkbox" name="lembrar" /> Manter conectado</label>' +
                '<button type="button" class="link-btn" data-action="open-modal" data-modal="forgot">Esqueceu a senha?</button>' +
              '</div>' +
              '<button type="submit" class="btn btn--primary btn--lg btn--block" id="login-submit">Entrar' + icon('arrow-right') + '</button>' +
            '</form>' +

            '<div class="auth__divider">primeiro acesso</div>' +
            '<button type="button" class="btn btn--outline btn--block" data-action="open-modal" data-modal="register">Criar minha conta</button>' +

            '<div class="auth__demo mt-16">' + icon('info') +
              '<span><strong>Ambiente de demonstração.</strong> Entre com qualquer usuário e senha para explorar o perfil de <strong id="demo-role">' + D.users[state.loginRole].roleLabel + '</strong>.</span>' +
            '</div>' +
            '<p class="auth__foot">Ao entrar, você concorda com as diretrizes de uso da escola.</p>' +
          '</div>' +
        '</section>' +
      '</div>';
    document.body.classList.remove('is-auth');
    applyTheme(state.theme);
  }

  function selectLoginRole(role) {
    if (!D.users[role]) return;
    state.loginRole = role;
    $$('.role-tab').forEach(function (tab) {
      tab.setAttribute('aria-selected', String(tab.dataset.role === role));
    });
    var demo = $('#demo-role');
    if (demo) demo.textContent = D.users[role].roleLabel;
  }

  /* ---------- App shell ---------- */
  function sidebar(role) {
    var nav = navModel(role);
    var user = currentUser();
    var links = function (items) {
      return items.map(function (item) {
        var active = state.route === item.route;
        return '<a class="nav-link" href="#/' + item.route + '"' + (active ? ' aria-current="page"' : '') + '>' +
          icon(item.icon) + '<span>' + esc(item.label) + '</span>' +
          (item.count ? '<span class="nav-link__count">' + item.count + '</span>' : '') +
        '</a>';
      }).join('');
    };
    return '<aside class="sidebar" aria-label="Menu lateral">' +
      '<div class="sidebar__brand">' + logo() + '<p class="sidebar__tagline">Conforto e<br>acolhimento.</p></div>' +
      '<nav class="sidebar__nav">' +
        '<span class="nav-label">Menu</span>' + links(nav.main) +
        '<span class="nav-label">Conta</span>' + links(nav.account) +
      '</nav>' +
      '<div class="sidebar__foot">' +
        '<a class="sidebar__user" href="#/perfil">' + avatar(user.name, 'avatar--brand') +
          '<span class="sidebar__user-info"><span class="sidebar__user-name">' + esc(user.name) + '</span>' +
          '<span class="sidebar__user-role">' + esc(user.roleLabel) + (user.turma ? ' · ' + esc(user.turma) : '') + '</span></span>' +
          icon('chevron-right') +
        '</a>' +
        '<div class="sidebar__tools">' +
          '<span class="sidebar__theme-note">Tema ' + (state.theme === 'dark' ? 'escuro' : 'claro') + '</span>' +
          '<button type="button" class="icon-btn icon-btn--ghost js-theme-toggle" data-action="toggle-theme" aria-label="Alternar tema"></button>' +
        '</div>' +
      '</div>' +
    '</aside>';
  }

  function topbar(role) {
    var meta = pageMeta(role, state.route);
    var user = currentUser();
    var unread = unreadCount();
    return '<header class="topbar">' +
      '<div class="page-intro">' +
        '<p class="eyebrow">' + icon('sparkle') + esc(meta.eyebrow) + '</p>' +
        '<h1 class="page-title">' + esc(meta.title) + '</h1>' +
        '<p class="page-sub">' + esc(meta.sub) + '</p>' +
      '</div>' +
      '<div class="topbar__actions">' +
        '<a class="icon-btn" href="#/notificacoes" aria-label="Notificações' + (unread ? ': ' + unread + ' não lidas' : '') + '" title="Notificações">' +
          icon('bell') + (unread ? '<span class="badge-count">' + unread + '</span>' : '') +
        '</a>' +
        '<button type="button" class="icon-btn js-theme-toggle" data-action="toggle-theme" aria-label="Alternar tema"></button>' +
        '<a class="topbar__user" href="#/perfil"><span>' + esc(user.shortName) + '</span>' + avatar(user.name, 'avatar--brand') + '</a>' +
      '</div>' +
    '</header>';
  }

  function mobileBar(role) {
    var user = currentUser();
    var unread = unreadCount();
    return '<header class="mobile-bar">' +
      '<a class="mobile-bar__brand" href="#/inicio" aria-label="Lordão Academic — início">' + logo() + '</a>' +
      '<div class="mobile-bar__actions">' +
        '<a class="icon-btn" href="#/notificacoes" aria-label="Notificações' + (unread ? ': ' + unread + ' não lidas' : '') + '">' + icon('bell') + (unread ? '<span class="badge-count">' + unread + '</span>' : '') + '</a>' +
        '<button type="button" class="icon-btn js-theme-toggle" data-action="toggle-theme" aria-label="Alternar tema"></button>' +
        '<a class="topbar__user" href="#/perfil" style="padding:2px" aria-label="Perfil de ' + esc(user.name) + '">' + avatar(user.name, 'avatar--brand') + '</a>' +
      '</div>' +
    '</header>';
  }

  function mobilePageHead(role) {
    if (state.route === 'inicio') return '';
    var meta = pageMeta(role, state.route);
    return '<div class="mobile-page-head">' +
      '<p class="eyebrow">' + icon('sparkle') + esc(meta.eyebrow) + '</p>' +
      '<h1>' + esc(meta.title) + '</h1>' +
      '<p>' + esc(meta.sub) + '</p>' +
    '</div>';
  }

  function bottomNav(role) {
    var nav = navModel(role);
    var items = nav.main.concat([{ route: 'perfil', label: 'Perfil', short: 'Perfil', icon: 'user' }]);
    return '<nav class="bottom-nav" aria-label="Navegação principal" style="--nav-count:' + items.length + '">' +
      items.map(function (item) {
        var active = state.route === item.route;
        return '<a class="bottom-link" href="#/' + item.route + '"' + (active ? ' aria-current="page"' : '') + '>' +
          icon(item.icon) + '<span>' + esc(item.short) + '</span>' +
          (item.route === 'notificacoes' && unreadCount() ? '<span class="bottom-link__badge"></span>' : '') +
        '</a>';
      }).join('') +
    '</nav>';
  }

  function renderApp() {
    if (!state.session) { renderAuth(); return; }
    var role = state.session.role;
    var page = renderPage(role, state.route);
    app.innerHTML =
      '<div class="app-shell">' +
        sidebar(role) +
        '<div class="main">' +
          mobileBar(role) +
          '<div class="page-wrap">' +
            topbar(role) +
            mobilePageHead(role) +
            '<main id="conteudo" class="page" tabindex="-1">' + page + '</main>' +
          '</div>' +
        '</div>' +
        bottomNav(role) +
      '</div>';
    applyTheme(state.theme);
  }

  function renderPage(role, currentRoute) {
    if (currentRoute === 'notificacoes') return pageNotifications();
    if (currentRoute === 'perfil') return pageProfile();
    if (role === 'aluno') {
      if (currentRoute === 'agenda') return pageAgenda();
      if (currentRoute === 'atividades') return pageActivities();
      if (currentRoute === 'notas') return pageGrades();
      return pageStudentHome();
    }
    if (role === 'professor') {
      if (currentRoute === 'turmas') return pageTeacherClasses();
      if (currentRoute === 'lancamentos') return pageTeacherActivities();
      if (currentRoute === 'diario') return pageTeacherDiary();
      return pageTeacherHome();
    }
    if (role === 'secretaria') {
      if (currentRoute === 'turmas') return pageSecretaryClasses();
      if (currentRoute === 'usuarios') return pageSecretaryUsers();
      if (currentRoute === 'noticias') return pageSecretaryNews();
      return pageSecretaryHome();
    }
    return pageStudentHome();
  }

  /* ======================================================================
     ALUNO — Início
     ====================================================================== */
  function nextStudentClass() {
    var key = D.schedule[todayKey()] ? todayKey() : 'seg';
    var list = (D.schedule[key] || []).filter(function (c) { return !c.break; });
    var now = nowMinutes();
    var next = list.filter(function (c) { return toMinutes(c.end) > now; })[0] || list[0];
    return { item: next, key: key, isToday: key === todayKey() };
  }

  var PT_MONTHS = { jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };

  function activityTime(a) {
    var full = String(a.dueFull || '');
    var match = full.match(/(\d{1,2})\s+de\s+([a-zç]+)\s+de\s+(\d{4})/i);
    if (match) {
      var month = PT_MONTHS[match[2].toLowerCase().slice(0, 3)];
      if (month !== undefined) return new Date(Number(match[3]), month, Number(match[1])).getTime();
    }
    var parts = String(a.due || '').split(' ');
    var shortMonth = PT_MONTHS[(parts[1] || '').toLowerCase().slice(0, 3)];
    if (parts[0] && shortMonth !== undefined) return new Date(2026, shortMonth, Number(parts[0])).getTime();
    return Number.MAX_SAFE_INTEGER;
  }

  function sortedByDue(list) {
    return list.slice().sort(function (a, b) {
      var rankA = a.status === 'entregue' ? 1 : 0;
      var rankB = b.status === 'entregue' ? 1 : 0;
      if (rankA !== rankB) return rankA - rankB;
      return activityTime(a) - activityTime(b);
    });
  }

  function pageStudentHome() {
    var s = studentStats();
    var next = nextStudentClass();
    var cls = next.item || {};
    var news = state.news || [];
    var newsIndex = news.length ? state.newsIndex % news.length : 0;

    var slides = news.map(function (n) {
      return '<article class="news-slide">' +
        '<div class="news-art ' + esc(n.art) + '" aria-hidden="true">' + icon(n.icon) + '</div>' +
        '<div class="news-body">' +
          '<div class="news-meta"><span class="tag tag--brand">' + esc(n.category) + '</span>' +
            '<span class="news-date">' + esc(n.date) + ' · ' + esc(n.readTime) + '</span></div>' +
          '<h3 class="news-title">' + esc(n.title) + '</h3>' +
          '<p class="news-excerpt">' + esc(n.excerpt) + '</p>' +
          '<div class="news-foot">' +
            '<span class="news-author">' + avatar(n.author, 'avatar--sm avatar--sand') + esc(n.author) + '</span>' +
            '<button type="button" class="news-more" data-action="open-news" data-id="' + n.id + '">Ler notícia ' + icon('arrow-up-right') + '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    });

    var deliveries = sortedByDue(state.activities.filter(function (a) { return a.status === 'pendente' || a.status === 'atrasada'; })).slice(0, 3)
      .map(function (a) {
        var parts = a.due.split(' ');
        return '<div class="deadline">' +
          '<span class="deadline__date"><span class="deadline__day">' + esc(parts[0]) + '</span><span class="deadline__month">' + esc(parts[1] || '') + '</span></span>' +
          '<span class="deadline__body"><span class="deadline__title">' + esc(a.title) + '</span>' +
          '<span class="deadline__subject">' + esc(subject(a.subject).name) + (a.status === 'atrasada' ? ' · em atraso' : '') + '</span></span>' +
          '<button type="button" class="icon-btn icon-btn--ghost" style="width:30px;height:30px" data-action="open-activity" data-id="' + a.id + '" aria-label="Ver atividade">' + icon('chevron-right') + '</button>' +
        '</div>';
      }).join('');

    return '' +
      '<section class="hero">' +
        '<div class="hero__content">' +
          '<p class="hero__eyebrow">' + icon('sun') + 'Seu resumo de hoje</p>' +
          '<h2 class="hero__title">' + greeting() + ', <em>' + esc(currentUser().firstName.split(' ')[0]) + '</em>.</h2>' +
          '<p class="hero__text">Sua próxima aula é ' + esc(subject(cls.subject || 'matematica').name) + ' às ' + esc(cls.time || '07:30') +
            '. Você tem <strong>' + s.pending + ' atividades pendentes</strong>' + (s.late ? ' e ' + s.late + ' em atraso' : '') + '.</p>' +
          '<div class="hero__actions">' +
            '<a class="btn btn--primary" href="#/agenda">' + icon('calendar') + 'Ver agenda</a>' +
            '<a class="btn btn--outline" href="#/atividades">' + icon('tasks') + 'Minhas atividades</a>' +
          '</div>' +
        '</div>' +
        '<div class="hero__aside">' +
          '<div class="hero__next">' +
            '<p class="hero__next-label">' + icon('clock') + (next.isToday ? 'Próxima aula · hoje' : 'Próxima aula') + '</p>' +
            '<p class="hero__next-subject">' + subjectDot(cls.subject) + esc(subject(cls.subject).name) + '</p>' +
            '<p class="hero__next-meta">' + esc(cls.teacher || '') + ' · ' + esc(cls.room || '') + '</p>' +
            '<p class="hero__next-time">' + icon('clock') + esc(cls.time || '07:30') + ' — ' + esc(cls.end || '08:20') + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="hero__book" aria-hidden="true">' + icon('book', '', 250) + '</div>' +
      '</section>' +

      '<section class="stat-grid" aria-label="Resumo do aluno">' +
        '<div class="stat"><span class="stat__icon stat__icon--warn">' + icon('tasks') + '</span>' +
          '<div class="stat__body"><p class="stat__label">Atividades pendentes</p><p class="stat__value">' + s.pending + '</p>' +
          '<p class="stat__hint">' + (s.late ? s.late + ' em atraso' : 'Tudo em dia') + '</p></div></div>' +
        '<div class="stat"><span class="stat__icon">' + icon('chart') + '</span>' +
          '<div class="stat__body"><p class="stat__label">Média geral</p><p class="stat__value">' + fmtNum(s.avg) + ' <small>/ 10</small></p>' +
          '<p class="stat__hint">Considerando as ' + (state.grades.length || 0) + ' disciplinas</p></div></div>' +
        '<div class="stat"><span class="stat__icon stat__icon--success">' + icon('check-circle') + '</span>' +
          '<div class="stat__body"><p class="stat__label">Frequência</p><p class="stat__value">' + Math.round(s.freq) + '%</p>' +
          '<p class="stat__hint">Presença no 2º bimestre</p></div></div>' +
      '</section>' +

      '<section class="grid grid--main">' +
        '<div class="card news-card">' +
          '<div class="news-card__head"><h2>Notícias da escola</h2>' +
            '<button type="button" class="section-head__link" data-action="all-news">Ver todas ' + icon('arrow-up-right') + '</button>' +
          '</div>' +
          (news.length ?
            '<div class="news-viewport">' + slides[newsIndex] + '</div>' +
            '<div class="carousel-foot">' +
              '<div class="carousel-dots">' + news.map(function (n, i) {
                return '<button type="button" class="carousel-dot' + (i === newsIndex ? ' is-active' : '') + '" data-action="news-dot" data-index="' + i + '" aria-label="Notícia ' + (i + 1) + '"' + (i === newsIndex ? ' aria-current="true"' : '') + '></button>';
              }).join('') + '</div>' +
              '<div class="carousel-arrows">' +
                '<button type="button" class="icon-btn" data-action="news-prev" aria-label="Notícia anterior">' + icon('chevron-left') + '</button>' +
                '<button type="button" class="icon-btn" data-action="news-next" aria-label="Próxima notícia">' + icon('chevron-right') + '</button>' +
              '</div>' +
            '</div>' :
            '<div class="empty"><span class="empty__icon">' + icon('megaphone') + '</span><h3>Nenhuma notícia publicada</h3><p>Assim que a secretaria publicar um comunicado, ele aparecerá aqui.</p></div>') +
        '</div>' +

        '<div class="card">' +
          '<div class="section-head" style="margin-bottom:8px"><div><h2>Próximas entregas</h2><p>Acompanhe os prazos da semana</p></div></div>' +
          '<div class="list">' + (deliveries || '<div class="empty"><span class="empty__icon">' + icon('check-circle') + '</span><h3>Tudo em dia!</h3><p>Nenhuma entrega pendente por aqui.</p></div>') + '</div>' +
          '<a class="btn btn--outline btn--block btn--sm mt-16" href="#/atividades">Ver todas as atividades</a>' +
        '</div>' +
      '</section>' +

      '<section>' +
        '<div class="section-head"><div><h2>Acesso rápido</h2><p>Atalhos para o seu dia a dia</p></div></div>' +
        '<div class="quick-grid">' +
          D.quickLinks.aluno.map(function (item) {
            return '<a class="quick-tile" href="#/' + item.route + '">' +
              '<span class="quick-tile__icon">' + icon(item.icon) + '</span>' +
              icon('arrow-up-right', 'quick-tile__arrow') +
              '<h3>' + esc(item.title) + '</h3><p>' + esc(item.text) + '</p>' +
            '</a>';
          }).join('') +
        '</div>' +
      '</section>';
  }

  /* ======================================================================
     ALUNO — Agenda
     ====================================================================== */
  function mondayOf(offset) {
    var d = new Date();
    var day = d.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff + (offset * 7));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getWeekDays(offset) {
    var keys = ['seg', 'ter', 'qua', 'qui', 'sex'];
    var labels = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
    var monday = mondayOf(offset || 0);
    return keys.map(function (key, i) {
      var d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        key: key,
        short: key.charAt(0).toUpperCase() + key.slice(1),
        label: labels[i],
        date: String(d.getDate()).padStart(2, '0'),
        month: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        full: d
      };
    });
  }

  function weekLabel(offset) {
    var days = getWeekDays(offset);
    var first = days[0].full;
    var last = days[4].full;
    var m1 = first.toLocaleDateString('pt-BR', { month: 'long' });
    var m2 = last.toLocaleDateString('pt-BR', { month: 'long' });
    if (m1 === m2) return first.getDate() + ' — ' + last.getDate() + ' de ' + m1;
    return first.getDate() + ' ' + m1.slice(0, 3) + ' — ' + last.getDate() + ' ' + m2.slice(0, 3);
  }

  function pageAgenda() {
    var days = getWeekDays(state.weekOffset || 0);
    var isCurrentWeek = (state.weekOffset || 0) === 0;
    var isToday = isCurrentWeek && state.day === todayKey();
    var classes = D.schedule[state.day] || [];
    var regular = classes.filter(function (c) { return !c.break; });
    var now = nowMinutes();
    var nextAssigned = false;

    var timeline = classes.map(function (c) {
      if (c.break) {
        return '<div class="class-card class-card--break">' +
          '<div class="class-card__time"><strong>' + esc(c.time) + '</strong><span>' + esc(c.end) + '</span></div>' +
          '<div class="class-card__main"><p class="class-card__subject">' + icon('coffee') + ' ' + esc(c.teacher) + ' · ' + esc(c.room) + '</p></div>' +
        '</div>';
      }
      var status = '';
      if (isToday) {
        var start = toMinutes(c.time);
        var end = toMinutes(c.end);
        if (now >= start && now < end) status = 'now';
        else if (now < start && !nextAssigned) { status = 'next'; nextAssigned = true; }
      }
      var tags = '';
      if (status === 'now') tags += '<span class="tag tag--success tag--sm">Agora</span>';
      if (status === 'next') tags += '<span class="tag tag--brand tag--sm">Próxima</span>';
      if (c.assessment) tags += '<span class="tag tag--warn tag--sm">' + esc(c.assessment) + '</span>';
      return '<article class="class-card' + (status === 'now' ? ' class-card--now' : '') + '">' +
        '<div class="class-card__time"><strong>' + esc(c.time) + '</strong><span>até ' + esc(c.end) + '</span></div>' +
        '<div class="class-card__main">' +
          '<p class="class-card__subject">' + subjectDot(c.subject) + esc(subject(c.subject).name) + '</p>' +
          '<p class="class-card__teacher">' + esc(c.teacher) + '</p>' +
        '</div>' +
        '<div class="class-card__meta"><span class="class-card__room">' + icon('pin') + esc(c.room) + '</span>' + tags + '</div>' +
      '</article>';
    }).join('');

    var selected = days.filter(function (d) { return d.key === state.day; })[0] || days[0];
    var assessments = regular.filter(function (c) { return c.assessment; }).length;

    return '' +
      '<section class="card">' +
        '<div class="agenda-toolbar">' +
          '<div class="week-nav">' +
            '<button type="button" class="icon-btn" data-action="week-shift" data-delta="-1" aria-label="Semana anterior">' + icon('chevron-left') + '</button>' +
            '<p class="week-nav__label">' + esc(weekLabel(state.weekOffset || 0)) + '<span>Semana letiva</span></p>' +
            '<button type="button" class="icon-btn" data-action="week-shift" data-delta="1" aria-label="Próxima semana">' + icon('chevron-right') + '</button>' +
          '</div>' +
          '<div class="flex-wrap">' +
            '<button type="button" class="btn btn--outline btn--sm" data-action="agenda-today">' + icon('calendar') + 'Hoje</button>' +
            '<button type="button" class="btn btn--soft btn--sm" data-action="toast" data-message="Exportação da agenda disponível após a integração com o calendário escolar." data-tone="info">' + icon('download') + 'Exportar</button>' +
          '</div>' +
        '</div>' +
        '<div class="day-picker mt-16" role="group" aria-label="Dias da semana">' +
          days.map(function (d) {
            var active = d.key === state.day;
            return '<button type="button" class="day-chip" data-action="select-day" data-day="' + d.key + '" aria-pressed="' + active + '">' +
              '<span class="day-chip__dow">' + esc(d.short) + '</span>' +
              '<span class="day-chip__date">' + esc(d.date) + '</span>' +
              '<span class="day-chip__dow" style="font-size:8px">' + esc(d.month) + '</span>' +
            '</button>';
          }).join('') +
        '</div>' +
      '</section>' +

      '<section class="grid grid--aside">' +
        '<div>' +
          '<div class="section-head"><div><h2>' + esc(selected.label) + ', ' + esc(selected.date) + ' de ' + esc(selected.month) + '</h2>' +
            '<p>' + regular.length + ' aulas · ' + (assessments ? assessments + ' avaliação' + (assessments > 1 ? 'ões' : '') : 'sem avaliações') + '</p></div>' +
            (isToday ? '<span class="tag tag--success">Hoje</span>' : '<span class="tag">' + esc(state.weekOffset ? 'Semana ' + (state.weekOffset > 0 ? 'seguinte' : 'anterior') : 'Semana atual') + '</span>') +
          '</div>' +
          '<div class="timeline">' + timeline + '</div>' +
        '</div>' +

        '<aside class="agenda-summary">' +
          '<div class="agenda-summary__hero">' +
            '<p class="agenda-summary__date">' + esc(selected.date) + '</p>' +
            '<p class="agenda-summary__day">' + esc(selected.label) + ' · ' + esc(selected.month) + ' de 2026</p>' +
            '<div class="mt-12">' +
              '<div class="summary-row"><span>Aulas do dia</span><strong>' + regular.length + '</strong></div>' +
              '<div class="summary-row"><span>Avaliações</span><strong>' + assessments + '</strong></div>' +
              '<div class="summary-row"><span>Atividades pendentes</span><strong>' + pendingCount() + '</strong></div>' +
              '<div class="summary-row"><span>Frequência</span><strong>' + Math.round(studentStats().freq) + '%</strong></div>' +
            '</div>' +
          '</div>' +
          '<div class="card card--brand card--flat">' +
            '<div class="row-between"><span class="tag tag--warn">Lembrete</span>' + icon('calendar') + '</div>' +
            '<p style="margin-top:11px;font-size:13px;font-weight:700;line-height:1.4">Prova de Matemática na sexta-feira</p>' +
            '<p class="small muted" style="margin-top:3px">Funções afim e quadrática · 08h20 · Sala 12</p>' +
            '<a class="btn btn--primary btn--sm btn--block mt-12" href="#/atividades">Revisar atividades</a>' +
          '</div>' +
        '</aside>' +
      '</section>';
  }

  /* ======================================================================
     ALUNO — Atividades
     ====================================================================== */
  function activityStatus(a) {
    if (a.status === 'atrasada') return { label: 'Em atraso', cls: 'danger', tone: 'danger' };
    if (a.status === 'entregue') return { label: 'Entregue', cls: 'success', tone: 'success' };
    return { label: 'Pendente', cls: 'warn', tone: 'warn' };
  }

  function activityCard(a) {
    var st = activityStatus(a);
    var s = subject(a.subject);
    return '<article class="activity' + (a.status === 'atrasada' ? ' activity--late' : '') + (a.status === 'entregue' ? ' activity--done' : '') + '">' +
      '<div class="activity__top">' +
        '<span class="activity__subject">' + subjectDot(a.subject) + esc(s.name) + '</span>' +
        '<span class="tag tag--' + st.cls + ' tag--sm">' + st.label + '</span>' +
      '</div>' +
      '<h3 class="activity__title"><button type="button" data-action="open-activity" data-id="' + a.id + '">' + esc(a.title) + '</button></h3>' +
      '<p class="activity__desc">' + esc(a.description) + '</p>' +
      '<div class="activity__meta">' +
        '<span>' + icon('user') + esc(a.teacher) + '</span>' +
        '<span>' + icon('calendar') + 'Entrega ' + esc(a.due) + '</span>' +
        '<span>' + icon('star') + esc(a.points) + ' pontos</span>' +
      '</div>' +
      '<div class="activity__foot">' +
        (a.status === 'entregue'
          ? '<span class="activity__grade">' + (a.grade ? 'Nota ' + esc(a.grade) : 'Aguardando correção') + '</span>'
          : '<span class="status status--' + st.tone + '">' + (a.status === 'atrasada' ? 'Atrasada' : 'A fazer') + '</span>') +
        '<button type="button" class="btn btn--sm ' + (a.status === 'entregue' ? 'btn--outline' : 'btn--brand') + '" data-action="open-activity" data-id="' + a.id + '">' +
          (a.status === 'entregue' ? 'Ver correção' : 'Abrir atividade') + '</button>' +
      '</div>' +
    '</article>';
  }

  function pageActivities() {
    var s = studentStats();
    var filters = [
      { key: 'todas', label: 'Todas', count: state.activities.length },
      { key: 'pendentes', label: 'Pendentes', count: state.activities.filter(function (a) { return a.status === 'pendente' || a.status === 'atrasada'; }).length },
      { key: 'entregues', label: 'Entregues', count: state.activities.filter(function (a) { return a.status === 'entregue'; }).length },
      { key: 'atrasadas', label: 'Em atraso', count: state.activities.filter(function (a) { return a.status === 'atrasada'; }).length }
    ];
    var list = sortedByDue(state.activities.filter(function (a) {
      if (state.activityFilter === 'pendentes') return a.status === 'pendente' || a.status === 'atrasada';
      if (state.activityFilter === 'entregues') return a.status === 'entregue';
      if (state.activityFilter === 'atrasadas') return a.status === 'atrasada';
      return true;
    }));
    var pct = s.total ? Math.round((s.done / s.total) * 100) : 0;

    return '' +
      '<section class="card">' +
        '<div class="row-between" style="align-items:flex-start;gap:18px;flex-wrap:wrap">' +
          '<div>' +
            '<p class="eyebrow">' + icon('tasks') + 'Progresso do bimestre</p>' +
            '<h2 style="font-size:20px">' + s.done + ' de ' + s.total + ' atividades concluídas</h2>' +
            '<p class="small muted mt-8">' + s.pending + ' pendentes' + (s.late ? ' · ' + s.late + ' em atraso' : '') + ' · fique de olho nos prazos</p>' +
          '</div>' +
          '<div style="text-align:right"><p class="stat__value">' + pct + '%</p><p class="small muted">concluído</p></div>' +
        '</div>' +
        '<div class="progress mt-16"><div class="progress__bar" style="width:' + pct + '%"></div></div>' +
      '</section>' +

      '<section>' +
        '<div class="filter-bar">' +
          '<div class="chip-row" role="group" aria-label="Filtrar atividades">' +
            filters.map(function (f) {
              return '<button type="button" class="chip" data-action="filter-activities" data-filter="' + f.key + '" aria-pressed="' + (state.activityFilter === f.key) + '">' +
                esc(f.label) + ' <span class="chip__count">' + f.count + '</span></button>';
            }).join('') +
          '</div>' +
          '<span class="small muted">' + list.length + ' atividade' + (list.length === 1 ? '' : 's') + ' exibida' + (list.length === 1 ? '' : 's') + '</span>' +
        '</div>' +
        '<div class="activity-grid mt-16">' +
          (list.length ? list.map(activityCard).join('') : '<div class="card empty" style="grid-column:1/-1"><span class="empty__icon">' + icon('check-circle') + '</span><h3>Nada por aqui</h3><p>Nenhuma atividade corresponde a este filtro.</p></div>') +
        '</div>' +
      '</section>';
  }

  /* ======================================================================
     ALUNO — Notas
     ====================================================================== */
  function pageGrades() {
    var s = studentStats();
    var rows = state.grades.map(function (g) {
      var sub = subject(g.key);
      var avg = subjectAverage(g);
      var statusTag = avg >= 7
        ? '<span class="tag tag--success tag--sm">No ritmo</span>'
        : (avg >= 6 ? '<span class="tag tag--warn tag--sm">Atenção</span>' : '<span class="tag tag--danger tag--sm">Recuperação</span>');
      var cell = function (v) {
        if (v === null || v === undefined) return '<td class="td-num"><span class="grade-pill grade-pill--empty">—</span></td>';
        return '<td class="td-num"><span class="grade-pill grade-pill--' + gradeTone(v) + '">' + fmtNum(v) + '</span></td>';
      };
      return '<tr>' +
        '<td><span class="td-subject">' + subjectDot(g.key) + esc(sub.name) + '</span></td>' +
        cell(g.b1) + cell(g.b2) + cell(g.b3) + cell(g.b4) +
        '<td class="td-num td-strong">' + fmtNum(avg) + '</td>' +
        '<td class="td-num">' + g.freq + '%</td>' +
        '<td>' + statusTag + '</td>' +
      '</tr>';
    }).join('');

    var freqRows = state.grades.slice().sort(function (a, b) { return b.freq - a.freq; }).map(function (g) {
      return '<div class="progress-row">' +
        '<div class="progress-row__head"><span>' + subjectDot(g.key) + esc(subject(g.key).name) + '</span><strong>' + g.freq + '%</strong></div>' +
        '<div class="progress ' + (g.freq >= 95 ? 'progress--success' : (g.freq < 90 ? 'progress--warn' : '')) + '"><div class="progress__bar" style="width:' + g.freq + '%"></div></div>' +
      '</div>';
    }).join('');

    return '' +
      '<section class="grade-summary">' +
        '<div class="grade-hero"><span class="stat__icon">' + icon('chart') + '</span><div>' +
          '<p class="grade-hero__label">Média geral</p><p class="grade-hero__value">' + fmtNum(s.avg) + ' <small>/ 10</small></p>' +
          '<p class="grade-hero__hint">' + (s.avg >= 7 ? 'Acima da média mínima de 7,0' : 'Abaixo da média mínima de 7,0') + '</p></div></div>' +
        '<div class="grade-hero"><span class="stat__icon stat__icon--success">' + icon('check-circle') + '</span><div>' +
          '<p class="grade-hero__label">Frequência</p><p class="grade-hero__value">' + Math.round(s.freq) + '%</p>' +
          '<p class="grade-hero__hint">Média entre as disciplinas</p></div></div>' +
        '<div class="grade-hero"><span class="stat__icon stat__icon--info">' + icon('compass') + '</span><div>' +
          '<p class="grade-hero__label">Situação</p><p class="grade-hero__value" style="font-size:23px">Em curso</p>' +
          '<p class="grade-hero__hint">Fechamento em dezembro</p></div></div>' +
      '</section>' +

      '<section class="grades-grid">' +
        '<div class="card" style="padding:0">' +
          '<div class="row-between" style="padding:18px 20px 12px;flex-wrap:wrap;gap:10px">' +
            '<div><h2 style="font-size:16px">Boletim por disciplina</h2><p class="small muted mt-0">2º bimestre em andamento · B4 ainda não lançado</p></div>' +
            '<button type="button" class="btn btn--outline btn--sm" data-action="toast" data-message="O boletim em PDF será gerado após a integração com a secretaria." data-tone="info">' + icon('download') + 'Baixar boletim</button>' +
          '</div>' +
          '<div class="table-wrap" style="border:0;border-radius:0">' +
            '<table class="table table--grades"><thead><tr><th>Disciplina</th><th style="text-align:center">1º</th><th style="text-align:center">2º</th><th style="text-align:center">3º</th><th style="text-align:center">4º</th><th style="text-align:center">Média</th><th style="text-align:center">Freq.</th><th>Situação</th></tr></thead>' +
            '<tbody>' + rows + '</tbody></table>' +
          '</div>' +
          '<div class="table-foot"><span>Atualizado em 22 out 2026 · ' + state.grades.length + ' disciplinas</span><span>Média mínima: 7,0</span></div>' +
        '</div>' +

        '<aside class="grades-side">' +
          '<div class="card">' +
            '<div class="section-head" style="margin-bottom:5px"><div><h2>Frequência por disciplina</h2><p>Presenças registradas no bimestre</p></div></div>' +
            freqRows +
          '</div>' +
          '<div class="card card--brand card--flat">' +
            '<div class="row-between"><span class="tag tag--brand">Como é calculada</span>' + icon('info') + '</div>' +
            '<p class="detail-text mt-12">A média de cada disciplina considera as notas dos quatro bimestres. A frequência mínima exigida é de <strong>75%</strong>.</p>' +
          '</div>' +
        '</aside>' +
      '</section>';
  }

  /* ======================================================================
     PROFESSOR — Início
     ====================================================================== */
  function nextTeacherClass() {
    var list = D.teacher.today;
    var now = nowMinutes();
    return list.filter(function (c) { return toMinutes(c.end) > now; })[0] || list[0];
  }

  function teacherClassTile(c) {
    return '<article class="class-tile">' +
      '<div class="class-tile__top">' +
        '<div><p class="class-tile__name">' + esc(c.name) + '</p><p class="class-tile__turno">' + esc(c.turno) + ' · ' + esc(c.room) + '</p></div>' +
        '<span class="class-tile__badge" style="color:' + c.color + ';background:' + c.color + '1f">' + c.students + '</span>' +
      '</div>' +
      '<div class="class-tile__stats">' +
        '<div class="class-tile__stat"><span>Média</span><strong>' + fmtNum(c.media) + '</strong></div>' +
        '<div class="class-tile__stat"><span>Frequência</span><strong>' + c.freq + '%</strong></div>' +
        '<div class="class-tile__stat"><span>Estudantes</span><strong>' + c.students + '</strong></div>' +
      '</div>' +
      '<div class="class-tile__foot">' +
        '<span class="small muted">' + icon('clock', 'inline-icon') + ' ' + esc(c.next) + '</span>' +
        '<div class="flex-wrap" style="gap:5px">' +
          '<button type="button" class="btn btn--outline btn--xs" data-action="class-students" data-id="' + c.id + '">Estudantes</button>' +
          '<button type="button" class="btn btn--soft btn--xs" data-action="open-diary" data-class="' + c.id + '">Diário</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function pageTeacherHome() {
    var next = nextTeacherClass();
    var classC = D.teacher.classes.filter(function (c) { return c.name === next.turma; })[0] || D.teacher.classes[0];
    var pendingCorrections = state.published.filter(function (p) { return p.status === 'corrigir'; });
    var agenda = D.teacher.today.map(function (c, i) {
      var now = nowMinutes();
      var active = now >= toMinutes(c.time) && now < toMinutes(c.end);
      return '<div class="list-item">' +
        '<span class="list-item__icon' + (active ? ' list-item__icon--brand' : '') + '">' + icon('clock') + '</span>' +
        '<span class="list-item__body"><span class="list-item__title">' + esc(c.turma) + ' · ' + esc(subject(c.subject).name) + '</span>' +
        '<span class="list-item__meta">' + esc(c.topic) + ' · ' + esc(c.room) + '</span></span>' +
        '<span class="list-item__end">' + esc(c.time) + (active ? ' <span class="tag tag--success tag--sm">Agora</span>' : '') + '</span>' +
      '</div>';
    }).join('');

    var corrections = pendingCorrections.length
      ? pendingCorrections.map(function (p) {
        return '<div class="deadline">' +
          '<span class="deadline__date"><span class="deadline__day">' + p.delivered + '</span><span class="deadline__month">entregas</span></span>' +
          '<span class="deadline__body"><span class="deadline__title">' + esc(p.title) + '</span>' +
          '<span class="deadline__subject">' + esc(p.turma) + ' · ' + (p.total - p.delivered) + ' aguardando envio</span></span>' +
          '<button type="button" class="btn btn--xs btn--brand" data-action="open-diary" data-class="' + (p.turma === '2º B' ? '2b' : (p.turma === '3º A' ? '3a' : '1c')) + '">Corrigir</button>' +
        '</div>';
      }).join('')
      : '<p class="small muted">Nenhuma correção pendente.</p>';

    return '' +
      '<section class="hero">' +
        '<div class="hero__content">' +
          '<p class="hero__eyebrow">' + icon('sun') + 'Sua rotina de hoje</p>' +
          '<h2 class="hero__title">' + greeting() + ', Prof. <em>' + esc(currentUser().firstName) + '</em>.</h2>' +
          '<p class="hero__text">Você tem <strong>4 aulas hoje</strong> e <strong>12 entregas</strong> aguardando correção. A próxima turma é o ' + esc(next.turma) + ', às ' + esc(next.time) + '.</p>' +
          '<div class="hero__actions">' +
            '<button type="button" class="btn btn--primary" data-action="open-modal" data-modal="new-activity">' + icon('plus') + 'Nova atividade</button>' +
            '<a class="btn btn--outline" href="#/diario">' + icon('edit') + 'Abrir diário</a>' +
          '</div>' +
        '</div>' +
        '<div class="hero__aside">' +
          '<div class="hero__next">' +
            '<p class="hero__next-label">' + icon('clock') + 'Próxima turma · hoje</p>' +
            '<p class="hero__next-subject">' + subjectDot(next.subject) + esc(next.turma) + ' · ' + esc(subject(next.subject).name) + '</p>' +
            '<p class="hero__next-meta">' + esc(next.topic) + ' · ' + esc(next.room) + '</p>' +
            '<p class="hero__next-time">' + icon('clock') + esc(next.time) + ' — ' + esc(next.end) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="hero__book" aria-hidden="true">' + icon('book', '', 250) + '</div>' +
      '</section>' +

      '<section class="stat-grid">' +
        '<div class="stat"><span class="stat__icon">' + icon('calendar') + '</span><div class="stat__body">' +
          '<p class="stat__label">Aulas hoje</p><p class="stat__value">4</p><p class="stat__hint">2º B · 3º A · 1º C</p></div></div>' +
        '<div class="stat"><span class="stat__icon stat__icon--warn">' + icon('clipboard') + '</span><div class="stat__body">' +
          '<p class="stat__label">Para corrigir</p><p class="stat__value">12</p><p class="stat__hint">Entregas da última semana</p></div></div>' +
        '<div class="stat"><span class="stat__icon stat__icon--success">' + icon('users') + '</span><div class="stat__body">' +
          '<p class="stat__label">Turmas</p><p class="stat__value">3</p><p class="stat__hint">90 estudantes no total</p></div></div>' +
      '</section>' +

      '<section class="grid grid--main">' +
        '<div class="card">' +
          '<div class="section-head"><div><h2>Agenda de hoje</h2><p>' + D.teacher.today.length + ' aulas · ' + esc(D.teacher.today[0].room) + ' e demais salas</p></div>' +
            '<a class="section-head__link" href="#/diario">Ver diário ' + icon('arrow-up-right') + '</a></div>' +
          '<div class="list">' + agenda + '</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="section-head" style="margin-bottom:8px"><div><h2>Correções pendentes</h2><p>Atividades com entregas a corrigir</p></div></div>' +
          '<div class="list">' + corrections + '</div>' +
          '<a class="btn btn--outline btn--block btn--sm mt-16" href="#/lancamentos">Ver todas as atividades</a>' +
        '</div>' +
      '</section>' +

      '<section>' +
        '<div class="section-head"><div><h2>Acesso rápido</h2><p>Atalhos do seu dia a dia</p></div></div>' +
        '<div class="quick-grid">' +
          D.quickLinks.professor.map(function (item) {
            return '<a class="quick-tile" href="#/' + item.route + '">' +
              '<span class="quick-tile__icon">' + icon(item.icon) + '</span>' + icon('arrow-up-right', 'quick-tile__arrow') +
              '<h3>' + esc(item.title) + '</h3><p>' + esc(item.text) + '</p></a>';
          }).join('') +
        '</div>' +
      '</section>';
  }

  /* ======================================================================
     PROFESSOR — Turmas
     ====================================================================== */
  function pageTeacherClasses() {
    return '' +
      '<section class="card">' +
        '<div class="row-between" style="flex-wrap:wrap;gap:14px">' +
          '<div><p class="eyebrow">' + icon('users') + 'Suas turmas em 2026</p>' +
          '<h2 style="font-size:20px">3 turmas · 90 estudantes</h2>' +
          '<p class="small muted mt-8">Matemática · 2º B, 3º A e 1º C</p></div>' +
          '<div class="flex-wrap">' +
            '<span class="tag tag--brand">' + icon('chart') + ' Média geral 7,9</span>' +
            '<span class="tag tag--success">' + icon('check-circle') + ' Frequência 95%</span>' +
          '</div>' +
        '</div>' +
      '</section>' +
      '<section class="class-grid">' + D.teacher.classes.map(teacherClassTile).join('') + '</section>' +
      '<section class="grid grid--2">' +
        '<div class="card">' +
          '<div class="section-head" style="margin-bottom:12px"><div><h2>Desempenho por turma</h2><p>Média do bimestre</p></div></div>' +
          '<div class="bar-chart">' +
            D.teacher.classes.map(function (c) {
              return '<div class="bar-row"><span class="bar-row__label">' + esc(c.name) + '</span>' +
                '<span class="bar-row__track"><span class="bar-row__fill" style="width:' + (c.media * 10) + '%"></span></span>' +
                '<span class="bar-row__value">' + fmtNum(c.media) + '</span></div>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="section-head" style="margin-bottom:12px"><div><h2>Próximos encontros</h2><p>Agenda de hoje</p></div></div>' +
          '<div class="list">' +
            D.teacher.today.map(function (c) {
              return '<div class="list-item"><span class="list-item__icon list-item__icon--brand">' + icon('calendar') + '</span>' +
                '<span class="list-item__body"><span class="list-item__title">' + esc(c.turma) + ' · ' + esc(c.room) + '</span>' +
                '<span class="list-item__meta">' + esc(c.topic) + '</span></span><span class="list-item__end">' + esc(c.time) + '</span></div>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</section>';
  }

  /* ======================================================================
     PROFESSOR — Atividades publicadas
     ====================================================================== */
  function teacherActivityCard(p) {
    var pct = Math.round((p.delivered / p.total) * 100);
    var statusMap = {
      aberta: { label: 'Aberta', cls: 'brand' },
      corrigir: { label: 'Para corrigir', cls: 'warn' },
      corrigida: { label: 'Corrigida', cls: 'success' }
    };
    var st = statusMap[p.status] || statusMap.aberta;
    return '<article class="activity">' +
      '<div class="activity__top"><span class="activity__subject">' + subjectDot('matematica') + 'Matemática</span>' +
        '<span class="tag tag--' + st.cls + ' tag--sm">' + st.label + '</span></div>' +
      '<h3 class="activity__title">' + esc(p.title) + '</h3>' +
      '<div class="activity__meta"><span>' + icon('users') + esc(p.turma) + '</span><span>' + icon('calendar') + 'Entrega ' + esc(p.due) + '</span></div>' +
      '<div class="mt-8">' +
        '<div class="row-between small muted" style="margin-bottom:5px"><span>' + p.delivered + ' de ' + p.total + ' entregaram</span><span>' + pct + '%</span></div>' +
        '<div class="progress"><div class="progress__bar" style="width:' + pct + '%"></div></div>' +
      '</div>' +
      '<div class="activity__foot"><span class="small muted">' + (p.total - p.delivered) + ' sem entrega</span>' +
        '<button type="button" class="btn btn--sm btn--outline" data-action="teacher-activity" data-id="' + p.id + '">Ver detalhes</button></div>' +
    '</article>';
  }

  function pageTeacherActivities() {
    var counts = {
      todas: state.published.length,
      aberta: state.published.filter(function (p) { return p.status === 'aberta'; }).length,
      corrigir: state.published.filter(function (p) { return p.status === 'corrigir'; }).length,
      corrigida: state.published.filter(function (p) { return p.status === 'corrigida'; }).length
    };
    var filter = state.teacherFilter || 'todas';
    var list = state.published.filter(function (p) { return filter === 'todas' || p.status === filter; });
    var totalDelivered = state.published.reduce(function (a, p) { return a + p.delivered; }, 0);

    return '' +
      '<section class="card">' +
        '<div class="row-between" style="flex-wrap:wrap;gap:14px;align-items:flex-start">' +
          '<div><p class="eyebrow">' + icon('clipboard') + '2º bimestre · Matemática</p>' +
          '<h2 style="font-size:20px">Atividades publicadas</h2>' +
          '<p class="small muted mt-8">' + state.published.length + ' atividades · ' + totalDelivered + ' entregas recebidas · 12 para corrigir</p></div>' +
          '<button type="button" class="btn btn--brand" data-action="open-modal" data-modal="new-activity">' + icon('plus') + 'Nova atividade</button>' +
        '</div>' +
      '</section>' +

      '<section class="filter-bar">' +
        '<div class="chip-row" role="group" aria-label="Filtrar atividades">' +
          [['todas', 'Todas'], ['aberta', 'Abertas'], ['corrigir', 'Para corrigir'], ['corrigida', 'Corrigidas']].map(function (f) {
            return '<button type="button" class="chip" data-action="filter-teacher" data-filter="' + f[0] + '" aria-pressed="' + (filter === f[0]) + '">' + f[1] + ' <span class="chip__count">' + counts[f[0]] + '</span></button>';
          }).join('') +
        '</div>' +
        '<span class="small muted">' + list.length + ' atividade' + (list.length === 1 ? '' : 's') + '</span>' +
      '</section>' +

      '<section class="activity-grid">' +
        (list.length ? list.map(teacherActivityCard).join('') : '<div class="card empty" style="grid-column:1/-1"><span class="empty__icon">' + icon('clipboard') + '</span><h3>Nenhuma atividade neste filtro</h3><p>Publique uma nova atividade ou selecione outro filtro.</p></div>') +
      '</section>';
  }

  /* ======================================================================
     PROFESSOR — Diário de classe
     ====================================================================== */
  function diaryClass() {
    return D.teacher.classes.filter(function (c) { return c.id === state.diaryClass; })[0] || D.teacher.classes[0];
  }

  function studentRowAverage(st) {
    var values = [st.b1, st.b2, st.b3, st.b4].filter(function (v) { return v !== null && v !== '' && v !== undefined && !isNaN(v); });
    return values.length ? values.reduce(function (a, b) { return a + Number(b); }, 0) / values.length : 0;
  }

  function attendanceFor(classId, idx) {
    var key = classId + ':' + idx;
    return state.attendance[key] || 'presente';
  }

  function pageTeacherDiary() {
    var cls = diaryClass();
    var students = state.students[cls.id] || [];
    var isGrades = state.diaryTab !== 'frequencia';

    var gradeRows = students.map(function (st, i) {
      var avg = studentRowAverage(st);
      var tone = avg >= 7 ? 'success' : (avg >= 6 ? 'warn' : 'danger');
      return '<tr data-student-row="' + i + '">' +
        '<td class="td-num muted">' + (i + 1) + '</td>' +
        '<td><div class="cell-user">' + avatar(st.name, 'avatar--sm') + '<div><div class="cell-user__name">' + esc(st.name) + '</div><div class="cell-user__sub">' + esc(st.matricula) + '</div></div></div></td>' +
        ['b1', 'b2', 'b3', 'b4'].map(function (key) {
          return '<td class="td-num"><input class="grade-input" type="number" min="0" max="10" step="0.1" value="' + (st[key] != null ? st[key] : '') + '" placeholder="—" data-grade="' + key + '" data-index="' + i + '" aria-label="' + key.toUpperCase() + ' de ' + esc(st.name) + '" /></td>';
        }).join('') +
        '<td class="td-num td-strong"><span class="js-row-avg grade-pill grade-pill--' + tone + '">' + (avg ? fmtNum(avg) : '—') + '</span></td>' +
        '<td><span class="tag tag--' + tone + ' tag--sm">' + (avg >= 7 ? 'No ritmo' : (avg >= 6 ? 'Atenção' : 'Recuperação')) + '</span></td>' +
      '</tr>';
    }).join('');

    var present = 0, absent = 0, justified = 0;
    students.forEach(function (st, i) {
      var a = attendanceFor(cls.id, i);
      if (a === 'presente') present++;
      else if (a === 'ausente') absent++;
      else justified++;
    });

    var attendanceRows = students.map(function (st, i) {
      var status = attendanceFor(cls.id, i);
      return '<tr>' +
        '<td class="td-num muted">' + (i + 1) + '</td>' +
        '<td><div class="cell-user">' + avatar(st.name, 'avatar--sm') + '<div><div class="cell-user__name">' + esc(st.name) + '</div><div class="cell-user__sub">' + esc(st.matricula) + '</div></div></div></td>' +
        '<td class="td-num"><span class="attendance-actions">' +
          '<button type="button" class="att-btn' + (status === 'presente' ? ' is-present' : '') + '" data-action="att" data-class="' + cls.id + '" data-idx="' + i + '" data-status="presente" aria-pressed="' + (status === 'presente') + '">P</button>' +
          '<button type="button" class="att-btn' + (status === 'ausente' ? ' is-absent' : '') + '" data-action="att" data-class="' + cls.id + '" data-idx="' + i + '" data-status="ausente" aria-pressed="' + (status === 'ausente') + '">F</button>' +
          '<button type="button" class="att-btn' + (status === 'justificada' ? ' is-justified' : '') + '" data-action="att" data-class="' + cls.id + '" data-idx="' + i + '" data-status="justificada" aria-pressed="' + (status === 'justificada') + '">J</button>' +
        '</span></td>' +
        '<td><span class="status status--' + (status === 'presente' ? 'success' : status === 'ausente' ? 'danger' : 'warn') + '">' + (status === 'presente' ? 'Presente' : status === 'ausente' ? 'Falta' : 'Justificada') + '</span></td>' +
      '</tr>';
    }).join('');

    return '' +
      '<section class="card">' +
        '<div class="diary-toolbar">' +
          '<div class="flex-wrap" style="align-items:center;gap:8px">' +
            '<label class="small muted" for="diary-class">Turma</label>' +
            '<select class="select" id="diary-class">' +
              D.teacher.classes.map(function (c) {
                return '<option value="' + c.id + '"' + (c.id === cls.id ? ' selected' : '') + '>' + esc(c.name) + ' · ' + esc(c.turno) + '</option>';
              }).join('') +
            '</select>' +
            '<span class="tag">' + icon('book') + ' Matemática</span>' +
          '</div>' +
          '<div class="flex-wrap" style="align-items:center;gap:8px">' +
            '<div class="diary-tabs" role="tablist" aria-label="Notas ou frequência">' +
              '<button type="button" class="diary-tab' + (isGrades ? ' is-active' : '') + '" data-action="diary-tab" data-tab="notas" role="tab" aria-selected="' + isGrades + '">Notas</button>' +
              '<button type="button" class="diary-tab' + (!isGrades ? ' is-active' : '') + '" data-action="diary-tab" data-tab="frequencia" role="tab" aria-selected="' + !isGrades + '">Frequência</button>' +
            '</div>' +
            '<button type="button" class="btn btn--brand btn--sm" data-action="save-diary">' + icon('save') + 'Salvar</button>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="diary-grid">' +
        '<div class="card" style="padding:0">' +
          '<div class="row-between" style="padding:18px 20px 12px;flex-wrap:wrap;gap:10px">' +
            '<div><h2 style="font-size:16px">' + (isGrades ? 'Lançamento de notas' : 'Frequência da turma') + '</h2>' +
            '<p class="small muted mt-0">' + esc(cls.name) + ' · ' + students.length + ' estudantes · ' + (isGrades ? '2º bimestre' : 'quinta-feira, 22 de outubro') + '</p></div>' +
            '<span class="tag tag--brand">' + esc(cls.room) + '</span>' +
          '</div>' +
          (isGrades
            ? '<div class="table-wrap" style="border:0;border-radius:0"><table class="table table--diary" id="grade-table"><thead><tr><th>#</th><th>Estudante</th><th style="text-align:center">1º</th><th style="text-align:center">2º</th><th style="text-align:center">3º</th><th style="text-align:center">4º</th><th style="text-align:center">Média</th><th>Situação</th></tr></thead><tbody>' + gradeRows + '</tbody></table></div>' +
              '<div class="table-foot"><span>As alterações são mantidas nesta demonstração.</span><span>Média mínima: 7,0</span></div>'
            : '<div class="table-wrap" style="border:0;border-radius:0"><table class="table table--diary"><thead><tr><th>#</th><th>Estudante</th><th style="text-align:center">Presença</th><th>Situação</th></tr></thead><tbody>' + attendanceRows + '</tbody></table></div>' +
              '<div class="table-foot"><span id="att-summary">' + present + ' presentes · ' + absent + ' faltas · ' + justified + ' justificadas</span>' +
              '<span class="flex-wrap" style="gap:8px"><span class="status status--success">P = presente</span><span class="status status--danger">F = falta</span><span class="status status--warn">J = justificada</span></span></div>') +
        '</div>' +

        '<aside class="diary-side">' +
          '<div class="card">' +
            '<div class="section-head" style="margin-bottom:8px"><div><h2>Resumo da turma</h2><p>' + esc(cls.name) + ' · Matemática</p></div></div>' +
            '<div class="summary-row"><span>Estudantes</span><strong>' + students.length + '</strong></div>' +
            '<div class="summary-row"><span>Média da turma</span><strong>' + fmtNum(cls.media) + '</strong></div>' +
            '<div class="summary-row"><span>Frequência</span><strong>' + cls.freq + '%</strong></div>' +
            '<div class="summary-row"><span>Atividades abertas</span><strong>' + state.published.filter(function (p) { return p.status === 'aberta'; }).length + '</strong></div>' +
            '<button type="button" class="btn btn--outline btn--block mt-12" data-action="class-students" data-id="' + cls.id + '">' + icon('users') + 'Ver estudantes da turma</button>' +
          '</div>' +
          '<div class="card card--brand card--flat">' +
            '<div class="row-between"><span class="tag tag--brand">Dica</span>' + icon('info') + '</div>' +
            '<p class="detail-text mt-12">Use <strong>P</strong> para presente, <strong>F</strong> para falta e <strong>J</strong> para falta justificada. O resumo é atualizado automaticamente.</p>' +
          '</div>' +
        '</aside>' +
      '</section>';
  }

  /* ======================================================================
     SECRETARIA — Visão geral
     ====================================================================== */
  function secretaryTotals() {
    return {
      classes: state.classes.length,
      students: state.classes.reduce(function (sum, c) { return sum + Number(c.students || 0); }, 0),
      teachers: state.accounts.filter(function (a) { return a.role === 'Professor' && a.status === 'Ativo'; }).length,
      news: state.managedNews.length
    };
  }

  function pageSecretaryHome() {
    var totals = secretaryTotals();
    var pending = state.accounts.filter(function (a) { return a.status === 'Pendente'; });
    var recent = state.news.slice(0, 3).map(function (n) {
      return '<div class="list-item"><span class="list-item__icon list-item__icon--brand">' + icon('megaphone') + '</span>' +
        '<span class="list-item__body"><span class="list-item__title">' + esc(n.title) + '</span>' +
        '<span class="list-item__meta">' + esc(n.category) + ' · ' + esc(n.date) + '</span></span>' +
        '<button type="button" class="icon-btn icon-btn--ghost" style="width:28px;height:28px" data-action="open-news" data-id="' + n.id + '" aria-label="Abrir notícia">' + icon('chevron-right') + '</button></div>';
    }).join('');

    return '' +
      '<section class="hero">' +
        '<div class="hero__content">' +
          '<p class="hero__eyebrow">' + icon('shield') + 'Painel da escola</p>' +
          '<h2 class="hero__title">' + greeting() + ', <em>' + esc(currentUser().firstName) + '</em>.</h2>' +
          '<p class="hero__text">A escola tem <strong>' + totals.classes + ' turmas ativas</strong> e <strong>' + totals.students + ' estudantes</strong> matriculados. ' + pending.length + ' novo acesso aguarda ativação.</p>' +
          '<div class="hero__actions">' +
            '<button type="button" class="btn btn--primary" data-action="open-modal" data-modal="new-user">' + icon('id-card') + 'Novo login</button>' +
            '<button type="button" class="btn btn--outline" data-action="open-modal" data-modal="new-news">' + icon('megaphone') + 'Publicar notícia</button>' +
          '</div>' +
        '</div>' +
        '<div class="hero__aside">' +
          '<div class="hero__next">' +
            '<p class="hero__next-label">' + icon('calendar') + 'Hoje na escola</p>' +
            '<p class="hero__next-subject">' + icon('users') + ' ' + totals.classes + ' turmas ativas</p>' +
            '<p class="hero__next-meta">Manhã e tarde · ' + totals.teachers + ' professores</p>' +
            '<p class="hero__next-time">' + icon('check-circle') + ' 2026 em curso</p>' +
          '</div>' +
        '</div>' +
        '<div class="hero__book" aria-hidden="true">' + icon('book', '', 250) + '</div>' +
      '</section>' +

      '<section class="stat-strip">' +
        '<div class="stat-mini"><span class="stat-mini__icon">' + icon('users') + '</span><div><p class="stat-mini__value">' + totals.classes + '</p><p class="stat-mini__label">Turmas ativas</p></div></div>' +
        '<div class="stat-mini"><span class="stat-mini__icon" style="color:var(--success)">' + icon('graduation') + '</span><div><p class="stat-mini__value">' + totals.students + '</p><p class="stat-mini__label">Estudantes</p></div></div>' +
        '<div class="stat-mini"><span class="stat-mini__icon" style="color:var(--warn)">' + icon('book') + '</span><div><p class="stat-mini__value">' + totals.teachers + '</p><p class="stat-mini__label">Professores</p></div></div>' +
        '<div class="stat-mini"><span class="stat-mini__icon" style="color:var(--info)">' + icon('megaphone') + '</span><div><p class="stat-mini__value">' + totals.news + '</p><p class="stat-mini__label">Notícias</p></div></div>' +
      '</section>' +

      '<section class="grid grid--main">' +
        '<div class="card">' +
          '<div class="section-head"><div><h2>Frequência por turma</h2><p>Média de presença no 2º bimestre</p></div><span class="tag tag--success">Média 94%</span></div>' +
          '<div class="bar-chart">' +
            [['1º A', 96], ['2º A', 94], ['3º A', 92], ['2º B', 97], ['3º B', 89]].map(function (row) {
              return '<div class="bar-row"><span class="bar-row__label">' + row[0] + '</span>' +
                '<span class="bar-row__track"><span class="bar-row__fill" style="width:' + row[1] + '%"></span></span>' +
                '<span class="bar-row__value">' + row[1] + '%</span></div>';
            }).join('') +
          '</div>' +
          '<div class="flex-wrap mt-16">' +
            '<span class="status status--success">Acima de 90%</span>' +
            '<span class="status status--warn">Atenção: 3º B</span>' +
          '</div>' +
        '</div>' +
        '<aside class="stack">' +
          '<div class="card">' +
            '<div class="section-head" style="margin-bottom:8px"><div><h2>Acessos pendentes</h2><p>' + pending.length + ' aguardando ativação</p></div></div>' +
            (pending.length
              ? pending.map(function (a) {
                return '<div class="list-item"><span class="list-item__icon list-item__icon--warn">' + icon('clock') + '</span>' +
                  '<span class="list-item__body"><span class="list-item__title">' + esc(a.name) + '</span><span class="list-item__meta">' + esc(a.role) + ' · ' + esc(a.turma) + '</span></span>' +
                  '<button type="button" class="btn btn--xs btn--brand" data-action="activate-account" data-login="' + esc(a.login) + '">Ativar</button></div>';
              }).join('')
              : '<p class="small muted">Nenhuma solicitação pendente.</p>') +
            '<a class="btn btn--outline btn--block btn--sm mt-12" href="#/usuarios">Gerenciar usuários</a>' +
          '</div>' +
          '<div class="card card--flat">' +
            '<div class="section-head" style="margin-bottom:8px"><div><h2>Últimos acessos</h2></div></div>' +
            D.secretary.recentLogins.map(function (l) {
              return '<div class="list-item"><span class="list-item__icon">' + icon('user') + '</span>' +
                '<span class="list-item__body"><span class="list-item__title">' + esc(l.name) + '</span><span class="list-item__meta">' + esc(l.turma) + '</span></span>' +
                '<span class="list-item__end">' + esc(l.time) + '</span></div>';
            }).join('') +
          '</div>' +
        '</aside>' +
      '</section>' +

      '<section class="grid grid--2">' +
        '<div class="card">' +
          '<div class="section-head"><div><h2>Notícias recentes</h2><p>Comunicados publicados pela escola</p></div><a class="section-head__link" href="#/noticias">Gerenciar ' + icon('arrow-up-right') + '</a></div>' +
          '<div class="list">' + recent + '</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="section-head"><div><h2>Acesso rápido</h2><p>Rotinas da secretaria</p></div></div>' +
          '<div class="quick-grid" style="grid-template-columns:1fr 1fr">' +
            D.quickLinks.secretaria.slice(0, 4).map(function (item) {
              return '<a class="quick-tile" href="#/' + item.route + '"><span class="quick-tile__icon">' + icon(item.icon) + '</span>' +
                icon('arrow-up-right', 'quick-tile__arrow') + '<h3>' + esc(item.title) + '</h3><p>' + esc(item.text) + '</p></a>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</section>';
  }

  /* ======================================================================
     SECRETARIA — Turmas
     ====================================================================== */
  function pageSecretaryClasses() {
    var totals = secretaryTotals();
    var manha = state.classes.filter(function (c) { return c.turno === 'Manhã'; });
    var tarde = state.classes.filter(function (c) { return c.turno === 'Tarde'; });
    var manhaStudents = manha.reduce(function (sum, c) { return sum + Number(c.students || 0); }, 0);
    var tardeStudents = tarde.reduce(function (sum, c) { return sum + Number(c.students || 0); }, 0);
    var average = state.classes.length ? (totals.students / state.classes.length).toFixed(1).replace('.', ',') : '0,0';
    var rows = state.classes.map(function (c) {
      return '<tr data-search="' + esc((c.name + ' ' + c.turno + ' ' + c.teacher).toLowerCase()) + '">' +
        '<td><span class="td-subject">' + avatar(c.name, 'avatar--sm avatar--sand') + esc(c.name) + '</span></td>' +
        '<td>' + esc(c.turno) + '</td>' +
        '<td class="td-num">' + c.students + '</td>' +
        '<td>' + esc(c.teacher) + '</td>' +
        '<td><span class="tag tag--success tag--sm">' + esc(c.status) + '</span></td>' +
        '<td class="td-actions"><button type="button" class="btn btn--outline btn--xs" data-action="class-view" data-id="' + c.id + '">Ver turma</button></td>' +
      '</tr>';
    }).join('');

    return '' +
      '<section class="card">' +
        '<div class="row-between" style="flex-wrap:wrap;gap:14px">' +
          '<div><p class="eyebrow">' + icon('users') + 'Ano letivo 2026</p>' +
          '<h2 style="font-size:20px">' + totals.classes + ' turmas · ' + totals.students + ' estudantes</h2>' +
          '<p class="small muted mt-8">' + state.classes.length + ' turmas cadastradas nesta demonstração</p></div>' +
          '<button type="button" class="btn btn--brand" data-action="open-modal" data-modal="new-class">' + icon('plus') + 'Nova turma</button>' +
        '</div>' +
      '</section>' +

      '<section class="card" style="padding:0">' +
        '<div class="table-toolbar" style="padding:16px 16px 0">' +
          '<div class="input-wrap">' + icon('search') +
            '<input class="input" id="search-classes" type="search" placeholder="Buscar turma, turno ou professor..." aria-label="Buscar turmas" />' +
          '</div>' +
          '<span class="tag">' + state.classes.length + ' turmas exibidas</span>' +
        '</div>' +
        '<div class="table-wrap" style="border:0;border-radius:0">' +
          '<table class="table" id="classes-table">' +
            '<thead><tr><th>Turma</th><th>Turno</th><th>Estudantes</th><th>Responsável</th><th>Situação</th><th style="text-align:right">Ações</th></tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
          '</table>' +
        '</div>' +
        '<div class="table-foot"><span class="js-visible">' + state.classes.length + ' turmas exibidas</span><span>Última atualização: 22 out 2026</span></div>' +
      '</section>' +

      '<section class="grid grid--3">' +
        '<div class="mini-card"><p class="mini-card__label">Turno da manhã</p><p class="mini-card__value">' + manha.length + ' turmas</p><p class="small muted">' + manhaStudents + ' estudantes</p></div>' +
        '<div class="mini-card"><p class="mini-card__label">Turno da tarde</p><p class="mini-card__value">' + tarde.length + ' turmas</p><p class="small muted">' + tardeStudents + ' estudantes</p></div>' +
        '<div class="mini-card"><p class="mini-card__label">Média de estudantes</p><p class="mini-card__value">' + average + '</p><p class="small muted">por turma</p></div>' +
      '</section>';
  }

  /* ======================================================================
     SECRETARIA — Usuários
     ====================================================================== */
  function pageSecretaryUsers() {
    var rows = state.accounts.map(function (a) {
      return '<tr data-role="' + esc(a.role) + '" data-search="' + esc((a.name + ' ' + a.login + ' ' + a.turma + ' ' + a.role).toLowerCase()) + '">' +
        '<td><div class="cell-user">' + avatar(a.name) + '<div><div class="cell-user__name">' + esc(a.name) + '</div><div class="cell-user__sub">' + esc(a.login) + '</div></div></div></td>' +
        '<td><span class="tag tag--' + (a.role === 'Aluno' ? 'brand' : a.role === 'Professor' ? 'info' : 'plain') + ' tag--sm">' + esc(a.role) + '</span></td>' +
        '<td>' + esc(a.turma) + '</td>' +
        '<td><span class="status status--' + (a.status === 'Ativo' ? 'success' : 'warn') + '">' + esc(a.status) + '</span></td>' +
        '<td class="small muted">' + esc(a.created) + '</td>' +
        '<td class="td-actions"><button type="button" class="icon-btn icon-btn--ghost" style="width:30px;height:30px" data-action="toast" data-message="Link de redefinição enviado para ' + esc(a.name) + ' (demonstração)." data-tone="info" aria-label="Redefinir senha de ' + esc(a.name) + '">' + icon('key') + '</button>' +
          '<button type="button" class="btn btn--xs ' + (a.status === 'Ativo' ? 'btn--outline' : 'btn--brand') + '" data-action="toggle-account" data-login="' + esc(a.login) + '">' + (a.status === 'Ativo' ? 'Desativar' : 'Ativar') + '</button></td>' +
      '</tr>';
    }).join('');

    return '' +
      '<section class="card">' +
        '<div class="row-between" style="flex-wrap:wrap;gap:14px">' +
          '<div><p class="eyebrow">' + icon('id-card') + 'Logins e permissões</p>' +
          '<h2 style="font-size:20px">Gestão de usuários</h2>' +
          '<p class="small muted mt-8">Alunos e professores recebem o login da secretaria no primeiro acesso.</p></div>' +
          '<button type="button" class="btn btn--brand" data-action="open-modal" data-modal="new-user">' + icon('plus') + 'Novo login</button>' +
        '</div>' +
      '</section>' +

      '<section class="card" style="padding:0">' +
        '<div class="table-toolbar" style="padding:16px 16px 0">' +
          '<div class="input-wrap">' + icon('search') +
            '<input class="input" id="search-users" type="search" placeholder="Buscar por nome, login ou turma..." aria-label="Buscar usuários" />' +
          '</div>' +
          '<select class="select" id="filter-role" style="min-height:40px;font-size:12.5px;width:auto" aria-label="Filtrar por perfil">' +
            '<option value="todos">Todos os perfis</option><option value="Aluno">Alunos</option><option value="Professor">Professores</option><option value="Secretaria">Secretaria</option>' +
          '</select>' +
        '</div>' +
        '<div class="table-wrap" style="border:0;border-radius:0">' +
          '<table class="table" id="users-table">' +
            '<thead><tr><th>Usuário</th><th>Perfil</th><th>Turma</th><th>Status</th><th>Criado em</th><th style="text-align:right">Ações</th></tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
          '</table>' +
        '</div>' +
        '<div class="table-foot"><span class="js-visible">' + state.accounts.length + ' contas exibidas</span><span>' + state.accounts.filter(function (a) { return a.status === 'Pendente'; }).length + ' aguardando ativação</span></div>' +
      '</section>' +

      '<section class="grid grid--3">' +
        '<div class="mini-card"><p class="mini-card__label">Alunos</p><p class="mini-card__value">' + state.accounts.filter(function (a) { return a.role === 'Aluno'; }).length + '</p><p class="small muted">logins de estudante</p></div>' +
        '<div class="mini-card"><p class="mini-card__label">Professores</p><p class="mini-card__value">' + state.accounts.filter(function (a) { return a.role === 'Professor'; }).length + '</p><p class="small muted">logins docentes</p></div>' +
        '<div class="mini-card"><p class="mini-card__label">Ativações pendentes</p><p class="mini-card__value">' + state.accounts.filter(function (a) { return a.status === 'Pendente'; }).length + '</p><p class="small muted">aguardando primeiro acesso</p></div>' +
      '</section>';
  }

  /* ======================================================================
     SECRETARIA — Notícias
     ====================================================================== */
  function pageSecretaryNews() {
    var filter = state.newsFilter || 'todas';
    var publishedCount = state.managedNews.filter(function (n) { return n.status === 'Publicada'; }).length;
    var draftCount = state.managedNews.filter(function (n) { return n.status === 'Rascunho'; }).length;
    var list = state.managedNews.filter(function (n) {
      if (filter === 'publicadas') return n.status === 'Publicada';
      if (filter === 'rascunhos') return n.status === 'Rascunho';
      return true;
    });

    var cards = list.map(function (n) {
      return '<article class="activity">' +
        '<div class="activity__top"><span class="activity__subject">' + icon('megaphone') + esc(n.category) + '</span>' +
          '<span class="tag tag--' + (n.status === 'Publicada' ? 'success' : 'warn') + ' tag--sm">' + esc(n.status) + '</span></div>' +
        '<h3 class="activity__title">' + esc(n.title) + '</h3>' +
        '<div class="activity__meta"><span>' + icon('user') + esc(n.author) + '</span><span>' + icon('calendar') + esc(n.date) + '</span></div>' +
        '<div class="activity__foot">' +
          '<span class="small muted">' + (n.status === 'Publicada' ? 'Visível para toda a escola' : 'Somente para a secretaria') + '</span>' +
          '<div class="flex-wrap" style="gap:5px">' +
            '<button type="button" class="btn btn--outline btn--xs" data-action="edit-news" data-id="' + n.id + '">' + icon('edit') + 'Editar</button>' +
            '<button type="button" class="btn btn--danger btn--xs" data-action="delete-news" data-id="' + n.id + '">' + icon('trash') + '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');

    return '' +
      '<section class="card">' +
        '<div class="row-between" style="flex-wrap:wrap;gap:14px">' +
          '<div><p class="eyebrow">' + icon('megaphone') + 'Comunicação escolar</p>' +
          '<h2 style="font-size:20px">Notícias e comunicados</h2>' +
          '<p class="small muted mt-8">' + publishedCount + ' publicada' + (publishedCount === 1 ? '' : 's') + ' · ' + draftCount + ' rascunho' + (draftCount === 1 ? '' : 's') + ' · atualizado agora</p></div>' +
          '<button type="button" class="btn btn--brand" data-action="open-modal" data-modal="new-news">' + icon('plus') + 'Nova notícia</button>' +
        '</div>' +
      '</section>' +

      '<section class="filter-bar">' +
        '<div class="chip-row" role="group" aria-label="Filtrar notícias">' +
          [['todas', 'Todas'], ['publicadas', 'Publicadas'], ['rascunhos', 'Rascunhos']].map(function (f) {
            return '<button type="button" class="chip" data-action="filter-news" data-filter="' + f[0] + '" aria-pressed="' + (filter === f[0]) + '">' + f[1] + '</button>';
          }).join('') +
        '</div>' +
        '<span class="small muted">' + list.length + ' notícia' + (list.length === 1 ? '' : 's') + '</span>' +
      '</section>' +

      '<section class="activity-grid">' +
        (list.length ? cards : '<div class="card empty" style="grid-column:1/-1"><span class="empty__icon">' + icon('megaphone') + '</span><h3>Nenhuma notícia neste filtro</h3><p>Publique um comunicado para a comunidade escolar.</p></div>') +
      '</section>';
  }

  /* ======================================================================
     COMUM — Notificações
     ====================================================================== */
  function noticeTone(type) {
    if (type === 'nota') return 'brand';
    if (type === 'atividade') return 'warn';
    if (type === 'frequencia') return 'success';
    return 'info';
  }

  function noticeIconClass(type) {
    if (type === 'atividade') return 'notice-item__icon--warn';
    if (type === 'frequencia') return 'notice-item__icon--success';
    if (type === 'aviso') return 'notice-item__icon--info';
    return '';
  }

  function pageNotifications() {
    var filter = state.noticeFilter || 'todas';
    var all = currentNotifications();
    var list = all.filter(function (n) {
      if (filter === 'unread') return n.unread;
      if (filter === 'nota' || filter === 'atividade' || filter === 'aviso' || filter === 'frequencia') return n.type === filter;
      return true;
    });
    var typeLabels = { nota: 'Notas', atividade: 'Atividades', aviso: 'Avisos', frequencia: 'Frequência' };
    var filters = [['todas', 'Todas'], ['unread', 'Não lidas']];
    ['nota', 'atividade', 'aviso', 'frequencia'].forEach(function (type) {
      if (all.some(function (n) { return n.type === type; })) filters.push([type, typeLabels[type]]);
    });
    var unread = unreadCount();
    var role = state.session ? state.session.role : 'aluno';
    var subtitle = role === 'professor'
      ? 'Entregas, turmas, diário e comunicados da coordenação.'
      : role === 'secretaria'
        ? 'Solicitações de acesso, turmas e comunicados da escola.'
        : 'Notas, atividades, frequência e comunicados da escola.';

    var items = list.map(function (n) {
      return '<button type="button" class="notice-item' + (n.unread ? ' notice-item--unread' : '') + '" data-action="open-notice" data-id="' + n.id + '">' +
        '<span class="notice-item__icon ' + noticeIconClass(n.type) + '">' + icon(n.icon) + '</span>' +
        '<span><span class="notice-item__title">' + (n.unread ? '<span class="dot"></span>' : '') + esc(n.title) + '</span>' +
          '<span class="notice-item__text">' + esc(n.text) + '</span>' +
          '<span class="notice-item__time">' + esc(n.time) + ' · ' + esc(n.type === 'nota' ? 'Nota' : n.type === 'atividade' ? 'Atividade' : n.type === 'frequencia' ? 'Frequência' : 'Aviso') + '</span></span>' +
        '<span class="notice-item__end">' + icon('chevron-right') + '</span>' +
      '</button>';
    }).join('');

    return '' +
      '<section class="card">' +
        '<div class="row-between" style="flex-wrap:wrap;gap:14px">' +
          '<div><p class="eyebrow">' + icon('bell') + 'Central de avisos</p>' +
          '<h2 style="font-size:20px">' + (unread ? unread + ' notificações não lidas' : 'Tudo em dia por aqui') + '</h2>' +
          '<p class="small muted mt-8">' + esc(subtitle) + '</p></div>' +
          '<button type="button" class="btn btn--outline btn--sm" data-action="mark-all-read"' + (unread ? '' : ' disabled') + '>' + icon('check') + 'Marcar todas como lidas</button>' +
        '</div>' +
      '</section>' +
      '<section class="filter-bar">' +
        '<div class="chip-row" role="group" aria-label="Filtrar notificações">' +
          filters.map(function (f) {
            var count = f[0] === 'todas' ? all.length : f[0] === 'unread' ? unread : all.filter(function (n) { return n.type === f[0]; }).length;
            return '<button type="button" class="chip" data-action="filter-notices" data-filter="' + f[0] + '" aria-pressed="' + (filter === f[0]) + '">' + f[1] + ' <span class="chip__count">' + count + '</span></button>';
          }).join('') +
        '</div>' +
      '</section>' +
      '<section class="notice-list">' +
        (list.length ? items : '<div class="card empty"><span class="empty__icon">' + icon('bell') + '</span><h3>Nenhuma notificação</h3><p>Não há avisos neste filtro no momento.</p></div>') +
      '</section>';
  }

  /* ======================================================================
     COMUM — Perfil
     ====================================================================== */
  function profileFacts(user) {
    if (user.role === 'aluno') {
      return [
        ['Matrícula', user.matricula],
        ['Turma', user.turma],
        ['Turno', user.turno],
        ['E-mail', user.email]
      ];
    }
    if (user.role === 'professor') {
      return [
        ['Registro', user.registro],
        ['Disciplina', user.disciplina],
        ['Turmas', user.turmas],
        ['E-mail', user.email]
      ];
    }
    return [
      ['Registro', user.registro],
      ['Setor', user.setor],
      ['Escola', 'ECIT Professor Lordão'],
      ['E-mail', user.email]
    ];
  }

  function pageProfile() {
    var user = currentUser();
    var facts = profileFacts(user).map(function (f) {
      return '<div class="detail-meta__item"><p class="detail-meta__label">' + esc(f[0]) + '</p><p class="detail-meta__value">' + esc(f[1]) + '</p></div>';
    }).join('');
    var tags = user.role === 'aluno'
      ? '<span class="tag tag--brand">' + esc(user.turma) + '</span><span class="tag">Matrícula ' + esc(user.matricula) + '</span><span class="tag">' + esc(user.turno) + '</span>'
      : '<span class="tag tag--brand">' + esc(user.roleLabel) + '</span><span class="tag">' + esc(user.disciplina || user.setor) + '</span>';

    return '<section class="card profile-card">' +
        '<div class="profile-card__bg"></div>' +
        '<div class="profile-card__body">' +
          '<span class="avatar avatar--xl avatar--brand profile-card__avatar" aria-hidden="true">' + esc(user.initials) + '</span>' +
          '<div class="profile-card__info">' +
            '<h2 class="profile-card__name">' + esc(user.name) + '</h2>' +
            '<p class="profile-card__meta">' + esc(user.roleLabel) + (user.turma ? ' · ' + esc(user.turma) : user.disciplina ? ' · ' + esc(user.disciplina) : '') + ' · desde ' + esc(user.since) + '</p>' +
            '<div class="profile-card__tags">' + tags + '</div>' +
          '</div>' +
          '<button type="button" class="btn btn--outline btn--sm" data-action="open-modal" data-modal="edit-profile">' + icon('edit') + 'Editar perfil</button>' +
        '</div>' +
      '</section>' +

      '<section class="grid grid--aside">' +
        '<div class="stack">' +
          '<div class="card">' +
            '<div class="section-head" style="margin-bottom:14px"><div><h2>Aparência</h2><p>Escolha o tema que combina com você</p></div></div>' +
            '<div class="theme-choices">' +
              '<button type="button" class="theme-choice' + (state.theme === 'light' ? ' is-active' : '') + '" data-action="choose-theme" data-theme-value="light" aria-pressed="' + (state.theme === 'light') + '">' +
                '<span class="theme-choice__preview preview--light"><i class="bar"></i><i class="block"></i><i class="bar" style="width:80%"></i></span>' +
                '<span><span class="theme-choice__label">Claro</span><span class="theme-choice__sub">Creme e azul-marinho</span></span>' +
                '<span class="theme-choice__end">' + (state.theme === 'light' ? icon('check-circle') : '') + '</span>' +
              '</button>' +
              '<button type="button" class="theme-choice' + (state.theme === 'dark' ? ' is-active' : '') + '" data-action="choose-theme" data-theme-value="dark" aria-pressed="' + (state.theme === 'dark') + '">' +
                '<span class="theme-choice__preview preview--dark"><i class="bar"></i><i class="block"></i><i class="bar" style="width:80%"></i></span>' +
                '<span><span class="theme-choice__label">Escuro</span><span class="theme-choice__sub">Marinho profundo e lilás</span></span>' +
                '<span class="theme-choice__end">' + (state.theme === 'dark' ? icon('check-circle') : '') + '</span>' +
              '</button>' +
            '</div>' +
          '</div>' +

          '<div class="card">' +
            '<div class="section-head" style="margin-bottom:10px"><div><h2>Preferências de aviso</h2><p>Escolha o que deseja receber</p></div></div>' +
            '<div class="pref-list">' +
              '<div class="pref-item"><div class="pref-item__body"><p class="pref-item__title">Atividades e prazos</p><p class="pref-item__text">Lembretes de entregas próximas</p></div>' +
                '<label class="switch"><input type="checkbox" data-pref="activities"' + (state.prefs.activities ? ' checked' : '') + ' aria-label="Avisos de atividades" /><span class="switch__track"></span></label></div>' +
              '<div class="pref-item"><div class="pref-item__body"><p class="pref-item__title">Notas e frequência</p><p class="pref-item__text">Avise quando uma nota for lançada</p></div>' +
                '<label class="switch"><input type="checkbox" data-pref="grades"' + (state.prefs.grades ? ' checked' : '') + ' aria-label="Avisos de notas" /><span class="switch__track"></span></label></div>' +
              '<div class="pref-item"><div class="pref-item__body"><p class="pref-item__title">Resumo semanal por e-mail</p><p class="pref-item__text">Um panorama toda sexta-feira</p></div>' +
                '<label class="switch"><input type="checkbox" data-pref="email"' + (state.prefs.email ? ' checked' : '') + ' aria-label="Resumo por e-mail" /><span class="switch__track"></span></label></div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<aside class="stack">' +
          '<div class="card">' +
            '<div class="section-head" style="margin-bottom:12px"><div><h2>Dados da conta</h2><p>Informações acadêmicas</p></div></div>' +
            '<div class="detail-meta">' + facts + '</div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="section-head" style="margin-bottom:10px"><div><h2>Segurança</h2><p>Acesso e sessão</p></div></div>' +
            '<div class="pref-list">' +
              '<div class="pref-item"><div class="pref-item__body"><p class="pref-item__title">Senha</p><p class="pref-item__text">Última alteração há 3 meses</p></div>' +
                '<button type="button" class="btn btn--outline btn--xs" data-action="open-modal" data-modal="change-password">Alterar</button></div>' +
              '<div class="pref-item"><div class="pref-item__body"><p class="pref-item__title">Sessão atual</p><p class="pref-item__text">' + icon('shield') + ' Acesso protegido</p></div>' +
                '<span class="status status--success">Ativa</span></div>' +
            '</div>' +
            '<button type="button" class="btn btn--danger btn--block btn--sm mt-16" data-action="logout">' + icon('logout') + 'Sair da conta</button>' +
          '</div>' +
          '<div class="about-card">' +
            '<span class="brand__mark" style="width:42px;height:42px">' + icon('book') + '</span>' +
            '<div class="about-card__text"><p class="about-card__title">Lordão Academic</p><p class="about-card__sub">Conforto e acolhimento</p></div>' +
            '<span class="about-card__ver">v1.0</span>' +
          '</div>' +
        '</aside>' +
      '</section>';
  }

  /* ======================================================================
     MODAIS
     ====================================================================== */
  function modalRegister() {
    openModal(modalShell({
      title: 'Criar minha conta',
      eyebrow: 'Primeiro acesso',
      sub: 'O login é liberado pela secretaria após a confirmação dos dados.',
      form: 'register',
      wide: true,
      body:
        '<div class="form-grid form-grid--2">' +
          '<div class="field"><label class="field__label" for="reg-name">Nome completo</label><input class="input" id="reg-name" name="nome" placeholder="Seu nome" required /></div>' +
          '<div class="field"><label class="field__label" for="reg-email">E-mail</label><input class="input" id="reg-email" name="email" type="email" placeholder="voce@email.com" required /></div>' +
          '<div class="field"><label class="field__label" for="reg-role">Perfil</label><select class="select" id="reg-role" name="perfil"><option value="Aluno">Aluno</option><option value="Professor">Professor</option></select></div>' +
          '<div class="field"><label class="field__label" for="reg-doc">Matrícula ou especialização</label><input class="input" id="reg-doc" name="documento" placeholder="2026-0000 / Matemática" required /></div>' +
          '<div class="field"><label class="field__label" for="reg-pass">Senha</label><input class="input" id="reg-pass" name="senha" type="password" placeholder="Mínimo de 6 caracteres" required minlength="6" /></div>' +
          '<div class="field"><label class="field__label" for="reg-pass2">Confirmar senha</label><input class="input" id="reg-pass2" name="confirmar" type="password" placeholder="Repita a senha" required /></div>' +
        '</div>' +
        '<label class="checkbox mt-16"><input type="checkbox" name="termos" required /> Li e aceito as diretrizes de uso e a política de privacidade da escola.</label>' +
        '<p class="small muted mt-12">Já tem acesso? Use o login fornecido pela secretaria no primeiro dia de aula.</p>',
      foot: '<button type="button" class="btn btn--outline" data-action="close-modal">Cancelar</button><button type="submit" class="btn btn--brand">Enviar solicitação</button>'
    }));
  }

  function modalForgot() {
    openModal(modalShell({
      title: 'Recuperar acesso',
      eyebrow: 'Esqueceu a senha?',
      sub: 'Informe o e-mail cadastrado para receber as instruções.',
      form: 'forgot',
      body:
        '<div class="field"><label class="field__label" for="forgot-email">E-mail cadastrado</label>' +
          '<div class="input-wrap">' + icon('mail') + '<input class="input" id="forgot-email" name="email" type="email" placeholder="voce@email.com" required /></div></div>' +
        '<p class="small muted mt-12">Se o e-mail estiver correto, você receberá um link válido por 30 minutos.</p>',
      foot: '<button type="button" class="btn btn--outline" data-action="close-modal">Cancelar</button><button type="submit" class="btn btn--brand">Enviar link</button>'
    }));
  }

  function modalEditProfile() {
    var user = currentUser();
    openModal(modalShell({
      title: 'Editar perfil',
      eyebrow: 'Sua conta',
      sub: 'Atualize seus dados de contato.',
      form: 'edit-profile',
      body:
        '<div class="form-grid">' +
          '<div class="field"><label class="field__label" for="prof-name">Nome completo</label><input class="input" id="prof-name" name="nome" value="' + esc(user.name) + '" required /></div>' +
          '<div class="field"><label class="field__label" for="prof-email">E-mail</label><input class="input" id="prof-email" name="email" type="email" value="' + esc(user.email) + '" required /></div>' +
        '</div>' +
        '<p class="small muted mt-12">Matrícula, turma e vínculo institucional só podem ser alterados pela secretaria.</p>',
      foot: '<button type="button" class="btn btn--outline" data-action="close-modal">Cancelar</button><button type="submit" class="btn btn--brand">Salvar alterações</button>'
    }));
  }

  function modalChangePassword() {
    openModal(modalShell({
      title: 'Alterar senha',
      eyebrow: 'Segurança',
      sub: 'Use pelo menos 6 caracteres e não compartilhe sua senha.',
      form: 'change-password',
      body:
        '<div class="form-grid">' +
          '<div class="field"><label class="field__label" for="pass-current">Senha atual</label><input class="input" id="pass-current" name="atual" type="password" required /></div>' +
          '<div class="field"><label class="field__label" for="pass-new">Nova senha</label><input class="input" id="pass-new" name="nova" type="password" minlength="6" required /></div>' +
          '<div class="field"><label class="field__label" for="pass-confirm">Confirmar nova senha</label><input class="input" id="pass-confirm" name="confirmar" type="password" minlength="6" required /></div>' +
        '</div>',
      foot: '<button type="button" class="btn btn--outline" data-action="close-modal">Cancelar</button><button type="submit" class="btn btn--brand">Atualizar senha</button>'
    }));
  }

  function modalNews(id) {
    var n = state.news.filter(function (x) { return x.id === id; })[0] ||
      state.managedNews.filter(function (x) { return x.id === id; })[0];
    if (!n) return;
    var full = state.news.filter(function (x) { return x.id === id; })[0] || n;
    var body = full.body || (full.bodyText ? full.bodyText.split(/\n+/).filter(Boolean) : [full.excerpt]);
    openModal(modalShell({
      title: full.title,
      eyebrow: full.category + ' · ' + full.date,
      sub: full.author + ' · ' + (full.readTime || 'Leitura rápida'),
      wide: true,
      body:
        '<div class="news-modal__art ' + esc(full.art || 'art-navy') + '">' + icon(full.icon || 'megaphone') + '</div>' +
        '<div class="news-modal__body">' + body.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
        '<div class="news-modal__meta">' + icon('user') + esc(full.author) + ' · ' + icon('calendar') + esc(full.date) + '</div>',
      foot: '<button type="button" class="btn btn--outline" data-action="close-modal">Fechar</button>' +
        '<button type="button" class="btn btn--brand" data-action="toast" data-message="Link da notícia copiado (demonstração)." data-tone="success">' + icon('send') + 'Compartilhar</button>'
    }));
  }

  function modalAllNews() {
    openModal(modalShell({
      title: 'Todas as notícias',
      eyebrow: 'Comunicação escolar',
      sub: state.news.length + ' comunicados publicados pela escola',
      wide: true,
      body: state.news.length ? '<div class="list">' + state.news.map(function (n) {
        return '<div class="list-item">' +
          '<span class="list-item__icon list-item__icon--brand">' + icon(n.icon) + '</span>' +
          '<span class="list-item__body"><span class="list-item__title">' + esc(n.title) + '</span>' +
          '<span class="list-item__meta">' + esc(n.category) + ' · ' + esc(n.date) + ' · ' + esc(n.author) + '</span></span>' +
          '<button type="button" class="btn btn--outline btn--xs" data-action="open-news" data-id="' + n.id + '">Ler</button>' +
        '</div>';
      }).join('') + '</div>' : '<div class="empty"><span class="empty__icon">' + icon('megaphone') + '</span><h3>Nenhuma notícia publicada</h3><p>Os comunicados da escola aparecerão aqui.</p></div>',
      foot: '<button type="button" class="btn btn--outline" data-action="close-modal">Fechar</button>'
    }));
  }

  function modalActivity(id) {
    var a = state.activities.filter(function (x) { return x.id === id; })[0];
    if (!a) return;
    var st = activityStatus(a);
    var isDone = a.status === 'entregue';
    var isLate = a.status === 'atrasada';
    var body =
      '<div class="row-between" style="align-items:flex-start">' +
        '<span class="activity__subject">' + subjectDot(a.subject) + esc(subject(a.subject).name) + ' · ' + esc(a.type) + '</span>' +
        '<span class="tag tag--' + st.cls + '">' + st.label + '</span>' +
      '</div>' +
      '<div class="detail-meta">' +
        '<div class="detail-meta__item"><p class="detail-meta__label">Professor</p><p class="detail-meta__value">' + esc(a.teacher) + '</p></div>' +
        '<div class="detail-meta__item"><p class="detail-meta__label">Entrega</p><p class="detail-meta__value">' + esc(a.dueFull) + '</p></div>' +
        '<div class="detail-meta__item"><p class="detail-meta__label">Valor</p><p class="detail-meta__value">' + esc(a.points) + ' pontos</p></div>' +
        '<div class="detail-meta__item"><p class="detail-meta__label">Situação</p><p class="detail-meta__value">' + (a.grade ? 'Nota ' + esc(a.grade) : st.label) + '</p></div>' +
      '</div>' +
      '<p class="modal__section-title">Orientações</p>' +
      '<p class="detail-text">' + esc(a.description) + '</p>' +
      (a.attachment
        ? '<div class="attachment"><span class="attachment__icon">' + icon('file-text') + '</span><div><p class="attachment__name">' + esc(a.attachment) + '</p><p class="attachment__size">' + esc(a.attachmentSize || '') + '</p></div>' +
          '<button type="button" class="icon-btn icon-btn--ghost" data-action="toast" data-message="Download disponível após a integração com o armazenamento." data-tone="info" aria-label="Baixar anexo">' + icon('download') + '</button></div>'
        : '') +
      (isDone
        ? '<div class="card card--tint mt-16" style="padding:14px"><div class="row-between"><span class="small muted">Entregue em ' + esc(a.submittedAt || a.dueFull) + '</span>' +
          (a.grade ? '<span class="tag tag--success">Nota ' + esc(a.grade) + '</span>' : '<span class="tag tag--warn">Aguardando correção</span>') + '</div></div>'
        : isLate
          ? '<div class="card card--tint mt-16" style="padding:14px"><div class="row-between"><span class="small muted">O prazo de entrega foi encerrado. Procure o professor para orientações.</span><span class="tag tag--danger">Em atraso</span></div></div>'
          : '<div class="field mt-16"><label class="field__label" for="comment">Comentário para o professor (opcional)</label>' +
            '<textarea class="textarea" id="comment" name="comentario" placeholder="Escreva uma observação sobre a sua entrega..."></textarea></div>' +
            '<div class="flex-wrap mt-12"><button type="button" class="btn btn--outline btn--sm" data-action="toast" data-message="Seleção de arquivo disponível após a integração com o armazenamento." data-tone="info">' + icon('paperclip') + 'Anexar arquivo</button>' +
            '<span class="small muted">PDF, DOCX ou imagem · até 10 MB</span></div>');

    if (isDone || isLate) {
      openModal(modalShell({
        title: a.title, eyebrow: 'Atividade · ' + subject(a.subject).name, sub: a.teacher, body: body,
        foot: '<button type="button" class="btn btn--outline" data-action="close-modal">Fechar</button>'
      }));
      return;
    }

    openModal(modalShell({
      title: a.title,
      eyebrow: 'Atividade · ' + subject(a.subject).name,
      sub: a.teacher,
      form: 'submit-activity',
      wide: true,
      body: '<input type="hidden" name="id" value="' + a.id + '" />' + body,
      foot: '<button type="button" class="btn btn--outline" data-action="close-modal">Cancelar</button>' +
        '<button type="submit" class="btn btn--brand">' + icon('check') + 'Marcar como entregue</button>'
    }));
  }

  function modalClassStudents(id) {
    var cls = D.teacher.classes.filter(function (c) { return c.id === id; })[0] || D.teacher.classes[0];
    var students = state.students[cls.id] || [];
    var avg = students.length ? students.reduce(function (acc, st) { return acc + studentRowAverage(st); }, 0) / students.length : cls.media;
    openModal(modalShell({
      title: cls.name + ' · estudantes',
      eyebrow: 'Turma de Matemática',
      sub: students.length + ' estudantes · ' + cls.turno + ' · ' + cls.room,
      wide: true,
      body:
        '<div class="stat-grid" style="grid-template-columns:repeat(3,1fr);gap:9px">' +
          '<div class="mini-card"><p class="mini-card__label">Média</p><p class="mini-card__value">' + fmtNum(avg) + '</p></div>' +
          '<div class="mini-card"><p class="mini-card__label">Frequência</p><p class="mini-card__value">' + cls.freq + '%</p></div>' +
          '<div class="mini-card"><p class="mini-card__label">Estudantes</p><p class="mini-card__value">' + students.length + '</p></div>' +
        '</div>' +
        '<div class="list mt-16">' + students.map(function (st, i) {
          var a = studentRowAverage(st);
          return '<div class="list-item"><span class="list-item__icon">' + (i + 1) + '</span>' +
            '<span class="list-item__body"><span class="list-item__title">' + esc(st.name) + '</span><span class="list-item__meta">' + esc(st.matricula) + ' · média ' + fmtNum(a) + '</span></span>' +
            '<span class="tag tag--' + (a >= 7 ? 'success' : a >= 6 ? 'warn' : 'danger') + ' tag--sm">' + (a >= 7 ? 'No ritmo' : a >= 6 ? 'Atenção' : 'Recuperação') + '</span></div>';
        }).join('') + '</div>',
      foot: '<button type="button" class="btn btn--outline" data-action="close-modal">Fechar</button>' +
        '<button type="button" class="btn btn--brand" data-action="open-diary" data-class="' + cls.id + '">' + icon('edit') + 'Abrir diário</button>'
    }));
  }

  function modalTeacherActivity(id) {
    var p = state.published.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    var students = state.students[p.turma === '2º B' ? '2b' : p.turma === '3º A' ? '3a' : '1c'] || [];
    var classId = p.turma === '2º B' ? '2b' : p.turma === '3º A' ? '3a' : '1c';
    var shown = students.slice(0, 6);
    openModal(modalShell({
      title: p.title,
      eyebrow: 'Matemática · ' + p.turma,
      sub: 'Entrega em ' + p.due + ' · ' + p.delivered + ' de ' + p.total + ' entregas recebidas',
      wide: true,
      body:
        '<div class="progress-row"><div class="progress-row__head"><span>Entregas recebidas</span><strong>' + p.delivered + '/' + p.total + '</strong></div>' +
          '<div class="progress"><div class="progress__bar" style="width:' + Math.round((p.delivered / p.total) * 100) + '%"></div></div></div>' +
        '<p class="modal__section-title">Últimas entregas</p>' +
        '<div class="list">' + shown.map(function (st, i) {
          var delivered = i < Math.min(shown.length, Math.round(p.delivered / p.total * shown.length));
          return '<div class="list-item"><span class="list-item__icon' + (delivered ? ' list-item__icon--success' : '') + '">' + icon(delivered ? 'check' : 'clock') + '</span>' +
            '<span class="list-item__body"><span class="list-item__title">' + esc(st.name) + '</span><span class="list-item__meta">' + esc(st.matricula) + '</span></span>' +
            '<span class="tag tag--' + (delivered ? 'success' : 'warn') + ' tag--sm">' + (delivered ? 'Entregue' : 'Pendente') + '</span></div>';
        }).join('') + '</div>' +
        '<p class="small muted mt-12">Exibindo ' + shown.length + ' de ' + students.length + ' estudantes da turma.</p>',
      foot: '<button type="button" class="btn btn--outline" data-action="close-modal">Fechar</button>' +
        '<button type="button" class="btn btn--brand" data-action="open-diary" data-class="' + classId + '">' + icon('edit') + 'Corrigir no diário</button>'
    }));
  }

  function modalNewActivity() {
    openModal(modalShell({
      title: 'Nova atividade',
      eyebrow: 'Publicar para uma turma',
      sub: 'A atividade aparecerá imediatamente para os estudantes.',
      form: 'new-activity',
      wide: true,
      body:
        '<div class="form-grid">' +
          '<div class="field"><label class="field__label" for="act-title">Título da atividade</label><input class="input" id="act-title" name="titulo" placeholder="Ex.: Lista de exercícios — funções" required /></div>' +
          '<div class="form-grid form-grid--2">' +
            '<div class="field"><label class="field__label" for="act-class">Turma</label><select class="select" id="act-class" name="turma"><option>2º B</option><option>3º A</option><option>1º C</option></select></div>' +
            '<div class="field"><label class="field__label" for="act-due">Prazo de entrega</label><input class="input" id="act-due" name="prazo" type="date" value="2026-10-30" required /></div>' +
          '</div>' +
          '<div class="form-grid form-grid--2">' +
            '<div class="field"><label class="field__label" for="act-value">Valor</label><input class="input" id="act-value" name="valor" type="number" min="0" max="10" step="0.5" value="10" required /></div>' +
            '<div class="field"><label class="field__label" for="act-type">Formato</label><select class="select" id="act-type" name="formato"><option>Lista</option><option>Trabalho</option><option>Relatório</option><option>Desafio</option></select></div>' +
          '</div>' +
          '<div class="field"><label class="field__label" for="act-desc">Orientações</label><textarea class="textarea" id="act-desc" name="descricao" placeholder="Descreva o que os estudantes devem fazer..." required></textarea></div>' +
        '</div>',
      foot: '<button type="button" class="btn btn--outline" data-action="close-modal">Cancelar</button><button type="submit" class="btn btn--brand">' + icon('send') + 'Publicar atividade</button>'
    }));
  }

  function modalClassView(id) {
    var c = state.classes.filter(function (x) { return x.id === id; })[0];
    if (!c) return;
    var students = state.students[c.id] || [];
    openModal(modalShell({
      title: c.name + ' · ' + c.turno,
      eyebrow: 'Detalhes da turma',
      sub: c.students + ' estudantes · responsável ' + c.teacher,
      wide: true,
      body:
        '<div class="stat-grid" style="grid-template-columns:repeat(3,1fr);gap:9px">' +
          '<div class="mini-card"><p class="mini-card__label">Estudantes</p><p class="mini-card__value">' + c.students + '</p></div>' +
          '<div class="mini-card"><p class="mini-card__label">Turno</p><p class="mini-card__value" style="font-size:16px">' + esc(c.turno) + '</p></div>' +
          '<div class="mini-card"><p class="mini-card__label">Situação</p><p class="mini-card__value" style="font-size:16px">' + esc(c.status) + '</p></div>' +
        '</div>' +
        (students.length
          ? '<p class="modal__section-title">Estudantes em destaque</p><div class="list">' + students.slice(0, 6).map(function (st) {
              return '<div class="list-item"><span class="list-item__icon">' + icon('user') + '</span>' +
                '<span class="list-item__body"><span class="list-item__title">' + esc(st.name) + '</span><span class="list-item__meta">' + esc(st.matricula) + '</span></span></div>';
            }).join('') + '</div>'
          : '<p class="small muted mt-16">A lista nominal completa será carregada com a integração da secretaria.</p>'),
      foot: '<button type="button" class="btn btn--outline" data-action="close-modal">Fechar</button>' +
        '<button type="button" class="btn btn--brand" data-action="toast" data-message="Login da turma gerado (demonstração)." data-tone="success">' + icon('id-card') + 'Gerar logins</button>'
    }));
  }

  function modalNewClass() {
    openModal(modalShell({
      title: 'Nova turma',
      eyebrow: 'Organização acadêmica',
      form: 'new-class',
      body:
        '<div class="form-grid">' +
          '<div class="field"><label class="field__label" for="class-name">Nome da turma</label><input class="input" id="class-name" name="nome" placeholder="Ex.: 1º D" required /></div>' +
          '<div class="form-grid form-grid--2">' +
            '<div class="field"><label class="field__label" for="class-turno">Turno</label><select class="select" id="class-turno" name="turno"><option>Manhã</option><option>Tarde</option></select></div>' +
            '<div class="field"><label class="field__label" for="class-students">Nº de estudantes</label><input class="input" id="class-students" name="alunos" type="number" min="1" max="45" value="30" required /></div>' +
          '</div>' +
          '<div class="field"><label class="field__label" for="class-teacher">Professor responsável</label><input class="input" id="class-teacher" name="professor" placeholder="Nome do professor" required /></div>' +
        '</div>',
      foot: '<button type="button" class="btn btn--outline" data-action="close-modal">Cancelar</button><button type="submit" class="btn btn--brand">Criar turma</button>'
    }));
  }

  function modalNewUser() {
    openModal(modalShell({
      title: 'Novo login',
      eyebrow: 'Gestão de acessos',
      sub: 'O usuário receberá uma senha provisória para o primeiro acesso.',
      form: 'new-user',
      wide: true,
      body:
        '<div class="form-grid form-grid--2">' +
          '<div class="field"><label class="field__label" for="user-name">Nome completo</label><input class="input" id="user-name" name="nome" placeholder="Nome do usuário" required /></div>' +
          '<div class="field"><label class="field__label" for="user-role">Perfil</label><select class="select" id="user-role" name="perfil"><option>Aluno</option><option>Professor</option><option>Secretaria</option></select></div>' +
          '<div class="field"><label class="field__label" for="user-turma">Turma</label><input class="input" id="user-turma" name="turma" placeholder="Ex.: 2º B (alunos)" /></div>' +
          '<div class="field"><label class="field__label" for="user-login">Login</label><input class="input" id="user-login" name="login" placeholder="nome.sobrenome" required /></div>' +
        '</div>' +
        '<div class="field mt-16"><label class="field__label" for="user-pass">Senha provisória</label><input class="input" id="user-pass" name="senha" value="lordao2026" required /></div>' +
        '<p class="small muted mt-12">O usuário deverá criar uma nova senha no primeiro acesso.</p>',
      foot: '<button type="button" class="btn btn--outline" data-action="close-modal">Cancelar</button><button type="submit" class="btn btn--brand">' + icon('key') + 'Criar login</button>'
    }));
  }

  function modalNewsForm(id) {
    var editing = id ? state.managedNews.filter(function (n) { return n.id === id; })[0] : null;
    var feedMatch = editing ? state.news.filter(function (n) { return n.id === editing.id; })[0] : null;
    var editingBody = editing ? (editing.bodyText || (feedMatch && feedMatch.body ? feedMatch.body.join('\n\n') : '')) : '';
    var editingExcerpt = editing ? (editing.excerpt || (feedMatch ? feedMatch.excerpt : '') || '') : '';
    openModal(modalShell({
      title: editing ? 'Editar notícia' : 'Nova notícia',
      eyebrow: 'Comunicação escolar',
      sub: editing ? 'Atualize o comunicado publicado.' : 'O comunicado ficará visível para toda a escola.',
      form: 'news-save',
      wide: true,
      body:
        '<input type="hidden" name="id" value="' + esc(editing ? editing.id : '') + '" />' +
        '<div class="form-grid">' +
          '<div class="field"><label class="field__label" for="news-title">Título</label><input class="input" id="news-title" name="titulo" value="' + esc(editing ? editing.title : '') + '" placeholder="Título da notícia" required /></div>' +
          '<div class="form-grid form-grid--2">' +
            '<div class="field"><label class="field__label" for="news-cat">Categoria</label><select class="select" id="news-cat" name="categoria">' +
              ['Aviso', 'Projeto', 'Biblioteca', 'ENEM', 'Esporte', 'Evento'].map(function (c) {
                return '<option' + (editing && editing.category === c ? ' selected' : '') + '>' + c + '</option>';
              }).join('') + '</select></div>' +
            '<div class="field"><label class="field__label" for="news-status">Publicação</label><select class="select" id="news-status" name="status"><option>Publicada</option><option' + (editing && editing.status === 'Rascunho' ? ' selected' : '') + '>Rascunho</option></select></div>' +
          '</div>' +
          '<div class="field"><label class="field__label" for="news-excerpt">Resumo</label><textarea class="textarea" id="news-excerpt" name="resumo" placeholder="Um parágrafo curto que aparece no cartão da notícia." required>' + esc(editingExcerpt) + '</textarea></div>' +
          '<div class="field"><label class="field__label" for="news-body">Conteúdo</label><textarea class="textarea" id="news-body" name="conteudo" style="min-height:130px" placeholder="Escreva o comunicado completo...">' + esc(editingBody) + '</textarea></div>' +
        '</div>',
      foot: '<button type="button" class="btn btn--outline" data-action="close-modal">Cancelar</button>' +
        '<button type="submit" class="btn btn--brand">' + icon('send') + (editing ? 'Salvar notícia' : 'Publicar notícia') + '</button>'
    }));
  }

  function openModalByName(name, id) {
    if (name === 'register') return modalRegister();
    if (name === 'forgot') return modalForgot();
    if (name === 'edit-profile') return modalEditProfile();
    if (name === 'change-password') return modalChangePassword();
    if (name === 'new-activity') return modalNewActivity();
    if (name === 'new-class') return modalNewClass();
    if (name === 'new-user') return modalNewUser();
    if (name === 'new-news') return modalNewsForm(null);
    if (name === 'edit-news') return modalNewsForm(id);
    if (name === 'activity') return modalActivity(id);
    if (name === 'news') return modalNews(id);
    if (name === 'all-news') return modalAllNews();
    if (name === 'class-students') return modalClassStudents(id);
    if (name === 'class-view') return modalClassView(id);
    if (name === 'teacher-activity') return modalTeacherActivity(id);
  }

  /* ======================================================================
     EVENTOS
     ====================================================================== */
  function setLoginError(message) {
    var box = $('#login-error');
    if (!box) return;
    box.classList.add('is-visible');
    var span = box.querySelector('span:last-child');
    if (span) span.textContent = message;
  }

  function formatShortDate(value) {
    if (!value) return '—';
    var d = new Date(value + 'T12:00:00');
    if (isNaN(d.getTime())) return value;
    return d.getDate() + ' ' + d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  }

  function formatLongDate(value) {
    if (!value) return '—';
    var d = new Date(value + 'T12:00:00');
    if (isNaN(d.getTime())) return value;
    return d.getDate() + ' de ' + d.toLocaleDateString('pt-BR', { month: 'long' }) + ' de ' + d.getFullYear();
  }

  function todayStamp() {
    return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '') + ' 2026';
  }

  function setUserFilter() {
    var input = $('#search-users');
    var roleSelect = $('#filter-role');
    if (!input || !roleSelect) return;
    var term = input.value.trim().toLowerCase();
    var role = roleSelect.value;
    var visible = 0;
    $$('#users-table tbody tr').forEach(function (row) {
      var match = (!term || row.dataset.search.indexOf(term) > -1) && (role === 'todos' || row.dataset.role === role);
      row.hidden = !match;
      if (match) visible++;
    });
    var count = $('#users-table').closest('.card').querySelector('.js-visible');
    if (count) count.textContent = visible + ' conta' + (visible === 1 ? '' : 's') + ' exibida' + (visible === 1 ? '' : 's');
  }

  function setClassFilter() {
    var input = $('#search-classes');
    if (!input) return;
    var term = input.value.trim().toLowerCase();
    var visible = 0;
    $$('#classes-table tbody tr').forEach(function (row) {
      var match = !term || row.dataset.search.indexOf(term) > -1;
      row.hidden = !match;
      if (match) visible++;
    });
    var count = $('#classes-table').closest('.card').querySelector('.js-visible');
    if (count) count.textContent = visible + ' turma' + (visible === 1 ? '' : 's') + ' exibida' + (visible === 1 ? '' : 's');
  }

  function updateAttendanceSummary(classId) {
    var students = state.students[classId] || [];
    var present = 0, absent = 0, justified = 0;
    students.forEach(function (st, i) {
      var a = attendanceFor(classId, i);
      if (a === 'presente') present++;
      else if (a === 'ausente') absent++;
      else justified++;
    });
    var summary = $('#att-summary');
    if (summary) summary.textContent = present + ' presentes · ' + absent + ' faltas · ' + justified + ' justificadas';
  }

  function syncDiaryGrades() {
    var students = state.students['2b'] || [];
    var target = students.filter(function (st) { return st.matricula === D.users.aluno.matricula; })[0];
    var grade = state.grades.filter(function (g) { return g.key === 'matematica'; })[0];
    if (!target || !grade) return;
    ['b1', 'b2', 'b3', 'b4'].forEach(function (key) { grade[key] = target[key]; });
  }

  function recalcRow(input) {
    var row = input.closest('tr');
    if (!row) return;
    var idx = Number(input.dataset.index);
    var key = input.dataset.grade;
    var students = state.students[state.diaryClass];
    if (!students || !students[idx]) return;
    var raw = input.value.trim();
    var value = raw === '' ? null : Math.max(0, Math.min(10, parseFloat(raw)));
    if (value !== null && isNaN(value)) value = null;
    students[idx][key] = value;
    syncDiaryGrades();

    var inputs = $$('.grade-input', row);
    var values = inputs.map(function (inp) {
      var n = parseFloat(inp.value);
      return inp.value.trim() !== '' && !isNaN(n) ? n : null;
    }).filter(function (v) { return v !== null; });
    var avg = values.length ? values.reduce(function (a, b) { return a + b; }, 0) / values.length : 0;
    var avgEl = $('.js-row-avg', row);
    if (avgEl) {
      avgEl.textContent = avg ? fmtNum(avg) : '—';
      avgEl.classList.remove('grade-pill--high', 'grade-pill--mid', 'grade-pill--low', 'grade-pill--success', 'grade-pill--warn', 'grade-pill--danger');
      if (avg) avgEl.classList.add('grade-pill--' + gradeTone(avg));
    }
    var tag = row.querySelector('td:last-child .tag');
    if (tag) {
      var tone = avg >= 7 ? 'success' : (avg >= 6 ? 'warn' : 'danger');
      tag.className = 'tag tag--' + tone + ' tag--sm';
      tag.textContent = avg >= 7 ? 'No ritmo' : (avg >= 6 ? 'Atenção' : 'Recuperação');
    }
  }

  function logout() {
    confirmDialog('Sair da conta?', 'Você precisará entrar novamente para acessar suas informações.', 'Sair', function () {
      localStorage.removeItem(STORE.session);
      state.session = null;
      state.route = 'inicio';
      history.replaceState(null, '', location.pathname + location.search);
      renderAuth();
      window.scrollTo(0, 0);
    });
  }

  function deleteNews(id) {
    var n = state.managedNews.filter(function (x) { return x.id === id; })[0];
    if (!n) return;
    confirmDialog('Excluir notícia?', 'A notícia "' + n.title + '" será removida da área da secretaria e da página inicial dos alunos.', 'Excluir notícia', function () {
      state.managedNews = state.managedNews.filter(function (x) { return x.id !== id; });
      state.news = state.news.filter(function (x) { return x.id !== id; });
      if (state.newsIndex >= state.news.length) state.newsIndex = 0;
      persistData();
      renderApp();
      toast('Notícia excluída', 'O comunicado foi removido da escola.', 'success');
    });
  }

  function onClick(event) {
    var overlay = event.target.closest('[data-modal-overlay]');
    if (overlay && event.target === overlay) {
      closeModal();
      return;
    }

    var target = event.target.closest('[data-action]');
    if (!target) return;
    var action = target.dataset.action;

    if (action === 'toggle-theme') { toggleTheme(); return; }
    if (action === 'login-role') { selectLoginRole(target.dataset.role); return; }
    if (action === 'toggle-password') {
      var input = document.getElementById(target.dataset.target);
      if (!input) return;
      var showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      target.innerHTML = icon(showing ? 'eye' : 'eye-off');
      target.setAttribute('aria-label', showing ? 'Mostrar senha' : 'Ocultar senha');
      return;
    }
    if (action === 'news-prev') { if (!state.news.length) return; state.newsIndex = (state.newsIndex - 1 + state.news.length) % state.news.length; renderApp(); return; }
    if (action === 'news-next') { if (!state.news.length) return; state.newsIndex = (state.newsIndex + 1) % state.news.length; renderApp(); return; }
    if (action === 'news-dot') { state.newsIndex = Number(target.dataset.index); renderApp(); return; }
    if (action === 'all-news') { openModalByName('all-news'); return; }
    if (action === 'open-news') { openModalByName('news', target.dataset.id); return; }
    if (action === 'filter-activities') { state.activityFilter = target.dataset.filter; renderApp(); return; }
    if (action === 'filter-teacher') { state.teacherFilter = target.dataset.filter; renderApp(); return; }
    if (action === 'filter-notices') { state.noticeFilter = target.dataset.filter; renderApp(); return; }
    if (action === 'filter-news') { state.newsFilter = target.dataset.filter; renderApp(); return; }
    if (action === 'open-activity') { openModalByName('activity', target.dataset.id); return; }
    if (action === 'select-day') { state.day = target.dataset.day; renderApp(); return; }
    if (action === 'week-shift') { state.weekOffset = (state.weekOffset || 0) + Number(target.dataset.delta); renderApp(); return; }
    if (action === 'agenda-today') {
      state.weekOffset = 0;
      state.day = ['seg', 'ter', 'qua', 'qui', 'sex'].indexOf(todayKey()) > -1 ? todayKey() : 'seg';
      renderApp();
      return;
    }
    if (action === 'choose-theme') { applyTheme(target.dataset.themeValue); renderApp(); return; }
    if (action === 'mark-all-read') {
      currentNotifications().forEach(function (n) { n.unread = false; });
      persistData();
      renderApp();
      toast('Tudo lido', 'Você marcou todas as notificações como lidas.');
      return;
    }
    if (action === 'open-notice') {
      var notice = currentNotifications().filter(function (n) { return n.id === target.dataset.id; })[0];
      if (!notice) return;
      notice.unread = false;
      persistData();
      if (notice.route) navigate(notice.route); else renderApp();
      return;
    }
    if (action === 'open-modal') { openModalByName(target.dataset.modal, target.dataset.id); return; }
    if (action === 'close-modal') { closeModal(); return; }
    if (action === 'confirm-action') {
      var fn = state.confirmAction;
      closeModal();
      if (fn) fn();
      return;
    }
    if (action === 'toast') {
      toast(target.dataset.tone === 'error' ? 'Não foi possível' : 'Tudo certo', target.dataset.message || '', target.dataset.tone || 'success');
      return;
    }
    if (action === 'activate-account' || action === 'toggle-account') {
      var login = target.dataset.login;
      var account = state.accounts.filter(function (a) { return a.login === login; })[0];
      if (!account) return;
      var activate = action === 'activate-account' ? true : account.status !== 'Ativo';
      account.status = activate ? 'Ativo' : 'Inativo';
      persistData();
      renderApp();
      toast(activate ? 'Acesso ativado' : 'Acesso desativado', activate ? 'O login de ' + account.name + ' já está liberado.' : 'O login de ' + account.name + ' foi bloqueado.', activate ? 'success' : 'info');
      return;
    }
    if (action === 'logout') { logout(); return; }
    if (action === 'open-diary') {
      state.diaryClass = target.dataset.class || state.diaryClass;
      state.diaryTab = 'notas';
      closeModal();
      navigate('diario');
      return;
    }
    if (action === 'class-students') { openModalByName('class-students', target.dataset.id); return; }
    if (action === 'class-view') { openModalByName('class-view', target.dataset.id); return; }
    if (action === 'teacher-activity') { openModalByName('teacher-activity', target.dataset.id); return; }
    if (action === 'edit-news') { openModalByName('edit-news', target.dataset.id); return; }
    if (action === 'delete-news') { deleteNews(target.dataset.id); return; }
    if (action === 'diary-tab') { state.diaryTab = target.dataset.tab; renderApp(); return; }
    if (action === 'save-diary') {
      syncDiaryGrades();
      persistData();
      if (state.diaryTab === 'frequencia') {
        toast('Frequência salva', 'Os registros da turma foram atualizados.');
      } else {
        toast('Notas salvas', 'As notas do 2º bimestre foram atualizadas e já aparecem para o aluno.');
      }
      return;
    }
    if (action === 'att') {
      var classId = target.dataset.class;
      var idx = target.dataset.idx;
      var status = target.dataset.status;
      state.attendance[classId + ':' + idx] = status;
      persistData();
      var row = target.closest('tr');
      $$('.att-btn', row).forEach(function (btn) {
        btn.classList.remove('is-present', 'is-absent', 'is-justified');
        btn.setAttribute('aria-pressed', 'false');
        if (btn.dataset.status === status) {
          btn.classList.add(status === 'presente' ? 'is-present' : status === 'ausente' ? 'is-absent' : 'is-justified');
          btn.setAttribute('aria-pressed', 'true');
        }
      });
      var statusEl = row.querySelector('td:last-child .status');
      if (statusEl) {
        statusEl.className = 'status status--' + (status === 'presente' ? 'success' : status === 'ausente' ? 'danger' : 'warn');
        statusEl.textContent = status === 'presente' ? 'Presente' : status === 'ausente' ? 'Falta' : 'Justificada';
      }
      updateAttendanceSummary(classId);
      return;
    }
  }

  function validateForm(form) {
    var fields = form.querySelectorAll('[required]');
    var first = null;
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      var value = String(f.value || '').trim();
      var empty = f.type === 'checkbox' ? !f.checked : !value;
      var invalidEmail = f.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (empty || invalidEmail) {
        f.classList.add('is-invalid');
        if (!first) first = f;
      } else {
        f.classList.remove('is-invalid');
      }
    }
    return first;
  }

  function suggestLogin(email) {
    var base = String(email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'usuario';
    var login = base;
    var n = 1;
    while (state.accounts.some(function (a) { return a.login === login; })) login = base + (n++);
    return login;
  }

  function onSubmit(event) {
    var form = event.target.closest('form[data-form]');
    if (!form) return;
    event.preventDefault();
    var data = new FormData(form);
    var type = form.dataset.form;
    var get = function (key) { return String(data.get(key) || '').trim(); };

    if (type !== 'login') {
      var invalid = validateForm(form);
      if (invalid) {
        toast('Confira os campos', invalid.type === 'email' ? 'Informe um e-mail válido para continuar.' : 'Preencha os campos obrigatórios para continuar.', 'error');
        if (invalid.focus) invalid.focus();
        return;
      }
    }

    if (type === 'login') {
      var user = get('usuario');
      var pass = get('senha');
      if (!user || !pass) {
        setLoginError('Informe o usuário e a senha para continuar.');
        return;
      }
      var btn = $('#login-submit');
      if (btn) { btn.classList.add('is-loading'); btn.disabled = true; }
      setTimeout(function () {
        state.session = { role: state.loginRole };
        try { localStorage.setItem(STORE.session, JSON.stringify(state.session)); } catch (e) { /* armazenamento indisponível */ }
        state.route = 'inicio';
        if (location.hash === '#/inicio') renderApp();
        else location.hash = '#/inicio';
        window.scrollTo(0, 0);
        toast('Bem-vindo de volta!', 'Login realizado como ' + D.users[state.loginRole].roleLabel + ' (demonstração).');
      }, 620);
      return;
    }

    if (type === 'register') {
      var p1 = get('senha');
      var p2 = get('confirmar');
      if (p1.length < 6) { toast('Senha muito curta', 'Use pelo menos 6 caracteres.', 'error'); return; }
      if (p1 !== p2) { toast('As senhas não conferem', 'Confira os campos e tente novamente.', 'error'); return; }
      if (!data.get('termos')) { toast('Aceite as diretrizes', 'É necessário concordar com as diretrizes de uso.', 'error'); return; }
      var regEmail = get('email').toLowerCase();
      var regRole = get('perfil') === 'Professor' ? 'Professor' : 'Aluno';
      var regLogin = suggestLogin(regEmail);
      state.accounts.unshift({
        name: get('nome'),
        login: regLogin,
        role: regRole,
        turma: '—',
        status: 'Pendente',
        created: todayStamp(),
        email: regEmail,
        document: get('documento')
      });
      persistData();
      closeModal();
      toast('Solicitação enviada', 'A secretaria vai confirmar seus dados e liberar o acesso ' + regLogin + '.');
      return;
    }

    if (type === 'forgot') {
      closeModal();
      toast('Link enviado', 'Se o e-mail estiver cadastrado, você receberá as instruções em instantes.', 'info');
      return;
    }

    if (type === 'edit-profile') {
      var account = currentUser();
      account.name = get('nome') || account.name;
      account.email = get('email') || account.email;
      account.initials = initials(account.name);
      closeModal();
      renderApp();
      toast('Perfil atualizado', 'Seus dados de contato foram salvos.');
      return;
    }

    if (type === 'change-password') {
      var nova = get('nova');
      if (nova.length < 6) { toast('Senha muito curta', 'A nova senha precisa ter 6 caracteres ou mais.', 'error'); return; }
      if (nova !== get('confirmar')) { toast('As senhas não conferem', 'Repita a nova senha corretamente.', 'error'); return; }
      closeModal();
      toast('Senha atualizada', 'Use a nova senha no próximo acesso.');
      return;
    }

    if (type === 'submit-activity') {
      var id = get('id');
      var activity = state.activities.filter(function (a) { return a.id === id; })[0];
      if (activity) {
        if (activity.status === 'atrasada') {
          closeModal();
          toast('Prazo encerrado', 'Esta atividade não aceita mais entregas. Procure o professor.', 'error');
          return;
        }
        activity.status = 'entregue';
        activity.comment = get('comentario');
        activity.submittedAt = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '') + ' 2026, às ' +
          new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        notificationsFor('professor').unshift({
          id: 'np' + Date.now(),
          type: 'atividade',
          icon: 'clipboard',
          title: 'Nova entrega recebida',
          text: D.users.aluno.name + ' entregou "' + activity.title + '".',
          time: 'agora',
          unread: true,
          route: 'lancamentos'
        });
      }
      persistData();
      closeModal();
      renderApp();
      toast('Atividade entregue!', 'Sua entrega foi registrada para o professor.');
      return;
    }

    if (type === 'new-activity') {
      var turma = get('turma');
      var titulo = get('titulo');
      var prazo = get('prazo');
      var formato = get('formato');
      var valor = get('valor');
      var descricao = get('descricao');
      var cls = D.teacher.classes.filter(function (c) { return c.name === turma; })[0];
      var dueShort = formatShortDate(prazo);
      var dueLong = formatLongDate(prazo);
      state.published.unshift({
        id: 'p' + Date.now(),
        title: titulo,
        turma: turma,
        due: dueShort,
        dueFull: dueLong,
        delivered: 0,
        total: cls ? cls.students : 30,
        status: 'aberta',
        format: formato,
        value: valor,
        description: descricao
      });
      if (turma === D.users.aluno.turma) {
        state.activities.unshift({
          id: 'a' + Date.now(),
          title: titulo,
          subject: 'matematica',
          teacher: currentUser().name,
          due: dueShort,
          dueFull: dueLong,
          status: 'pendente',
          type: formato,
          points: valor,
          description: descricao,
          attachment: null
        });
        notificationsFor('aluno').unshift({
          id: 'no' + Date.now(),
          type: 'atividade',
          icon: 'tasks',
          title: 'Nova atividade de Matemática',
          text: titulo + ' foi publicada. Entrega até ' + dueShort + '.',
          time: 'agora',
          unread: true,
          route: 'atividades'
        });
      }
      persistData();
      closeModal();
      if (state.route === 'lancamentos' || state.route === 'inicio') renderApp();
      toast('Atividade publicada', 'A turma ' + turma + ' já pode visualizar a nova atividade.');
      return;
    }

    if (type === 'new-class') {
      state.classes.push({
        id: 'c' + Date.now(),
        name: get('nome'),
        turno: get('turno'),
        students: Number(get('alunos')) || 0,
        teacher: get('professor'),
        status: 'Ativa'
      });
      persistData();
      closeModal();
      if (state.route === 'turmas') renderApp();
      toast('Turma criada', 'A turma ' + get('nome') + ' foi adicionada à organização de 2026.');
      return;
    }

    if (type === 'new-user') {
      var newLogin = get('login');
      if (state.accounts.some(function (a) { return a.login === newLogin; })) {
        toast('Login já cadastrado', 'Escolha outro identificador para este acesso.', 'error');
        return;
      }
      state.accounts.unshift({
        name: get('nome'),
        login: newLogin,
        role: get('perfil'),
        turma: get('turma') || '—',
        status: 'Ativo',
        created: todayStamp()
      });
      persistData();
      closeModal();
      if (state.route === 'usuarios') renderApp();
      toast('Login criado', 'A senha provisória foi gerada para ' + get('nome') + '.');
      return;
    }

    if (type === 'news-save') {
      var newsId = get('id');
      var statusNews = get('status');
      var content = get('conteudo');
      var titleNews = get('titulo');
      var categoryNews = get('categoria');
      var excerptNews = get('resumo');
      var bodyParas = content ? content.split(/\n+/).filter(Boolean) : [excerptNews];
      if (newsId) {
        var managed = state.managedNews.filter(function (n) { return n.id === newsId; })[0];
        var feedItem = state.news.filter(function (n) { return n.id === newsId; })[0];
        if (managed) {
          managed.title = titleNews;
          managed.category = categoryNews;
          managed.status = statusNews;
          managed.excerpt = excerptNews;
          managed.bodyText = content;
          if (statusNews === 'Publicada' && (!managed.date || managed.date === '—')) managed.date = todayStamp();
        }
        if (feedItem) {
          if (statusNews === 'Rascunho') {
            state.news = state.news.filter(function (n) { return n.id !== newsId; });
          } else {
            feedItem.title = titleNews;
            feedItem.category = categoryNews;
            feedItem.excerpt = excerptNews;
            feedItem.bodyText = content;
            feedItem.body = bodyParas;
          }
        } else if (managed && statusNews === 'Publicada') {
          state.news.unshift({
            id: managed.id,
            title: titleNews,
            category: categoryNews,
            date: managed.date && managed.date !== '—' ? managed.date : todayStamp(),
            author: managed.author || currentUser().name,
            excerpt: excerptNews,
            bodyText: content,
            body: bodyParas,
            readTime: managed.readTime || '2 min de leitura',
            art: managed.art || 'art-navy',
            icon: managed.icon || 'megaphone'
          });
        }
        persistData();
        closeModal();
        if (state.route === 'noticias' || state.route === 'inicio') renderApp();
        toast('Notícia atualizada', statusNews === 'Publicada' ? 'O comunicado já está visível para os alunos.' : 'A notícia foi movida para rascunhos.');
        return;
      }

      var newId = 'n' + Date.now();
      var newNews = {
        id: newId,
        title: titleNews,
        category: categoryNews,
        status: statusNews,
        date: statusNews === 'Publicada' ? todayStamp() : '—',
        author: currentUser().name,
        excerpt: excerptNews,
        bodyText: content || excerptNews,
        body: bodyParas,
        readTime: '2 min de leitura',
        art: 'art-navy',
        icon: 'megaphone'
      };
      state.managedNews.unshift(newNews);
      if (statusNews === 'Publicada') state.news.unshift(newNews);
      persistData();
      closeModal();
      if (state.route === 'noticias' || state.route === 'inicio') renderApp();
      toast(statusNews === 'Publicada' ? 'Notícia publicada' : 'Rascunho salvo', statusNews === 'Publicada' ? 'O comunicado já está visível para os alunos.' : 'Você pode publicar o rascunho quando quiser.');
      return;
    }
  }

  function onInput(event) {
    var t = event.target;
    if (t.id === 'search-classes') { setClassFilter(); return; }
    if (t.id === 'search-users') { setUserFilter(); return; }
    if (t.classList && t.classList.contains('grade-input')) { recalcRow(t); return; }
  }

  function onChange(event) {
    var t = event.target;
    if (t.id === 'diary-class') {
      state.diaryClass = t.value;
      state.diaryTab = state.diaryTab || 'notas';
      renderApp();
      return;
    }
    if (t.id === 'filter-role') { setUserFilter(); return; }
    if (t.hasAttribute && t.hasAttribute('data-pref')) {
      state.prefs[t.dataset.pref] = t.checked;
      try { localStorage.setItem(STORE.prefs, JSON.stringify(state.prefs)); } catch (e) { /* armazenamento indisponível */ }
      toast('Preferência atualizada', 'Suas escolhas de aviso foram salvas.', 'info');
      return;
    }
    if (t.classList && t.classList.contains('grade-input')) {
      var n = parseFloat(t.value);
      if (t.value !== '' && !isNaN(n)) {
        n = Math.max(0, Math.min(10, n));
        t.value = n.toFixed(1);
      }
      recalcRow(t);
    }
  }

  /* ---------- Teclado e modal ---------- */
  function onKeydown(event) {
    var modal = $('.modal');
    if (!modal) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key === 'Tab') {
      var focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal)
        .filter(function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  /* ---------- Rotas ---------- */
  function onHashChange() {
    if (!state.session) { renderAuth(); return; }
    state.route = route();
    renderApp();
    window.scrollTo(0, 0);
  }

  /* ---------- Inicialização ---------- */
  function init() {
    var today = todayKey();
    state.day = ['seg', 'ter', 'qua', 'qui', 'sex'].indexOf(today) > -1 ? today : 'seg';
    applyTheme(state.theme);

    document.addEventListener('click', onClick);
    document.addEventListener('submit', onSubmit);
    document.addEventListener('input', onInput);
    document.addEventListener('change', onChange);
    document.addEventListener('keydown', onKeydown);
    window.addEventListener('hashchange', onHashChange);

    if (state.session) {
      state.route = route();
      if (!location.hash) history.replaceState(null, '', location.pathname + location.search + '#/inicio');
      renderApp();
    } else {
      renderAuth();
    }
  }

  init();
})();
