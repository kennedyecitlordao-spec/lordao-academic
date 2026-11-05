/* Lordão Academic — dados de demonstração (somente front-end) */
(function () {
  'use strict';

  var subjects = {
    portugues: { name: 'Português', color: '#9C8FE0' },
    matematica: { name: 'Matemática', color: '#6FA8DC' },
    biologia: { name: 'Biologia', color: '#74C69D' },
    historia: { name: 'História', color: '#E0A96D' },
    geografia: { name: 'Geografia', color: '#6FC2C9' },
    filosofia: { name: 'Filosofia', color: '#D49AC6' },
    fisica: { name: 'Física', color: '#A3A7E8' },
    ingles: { name: 'Inglês', color: '#E8C468' },
    redacao: { name: 'Redação', color: '#D8A48F' },
    literatura: { name: 'Literatura', color: '#B9A5D8' },
    quimica: { name: 'Química', color: '#8FD0B5' },
    edfisica: { name: 'Ed. Física', color: '#9AB5C1' },
    sociologia: { name: 'Sociologia', color: '#C7B07A' },
    artes: { name: 'Artes', color: '#D99BB5' }
  };

  var users = {
    aluno: {
      role: 'aluno',
      roleLabel: 'Aluno',
      name: 'Maria Clara Nunes',
      firstName: 'Maria Clara',
      shortName: 'Maria',
      matricula: '2026-0142',
      turma: '2º B',
      turno: 'Manhã',
      email: 'maria.clara@lordao.edu.br',
      initials: 'MC',
      since: 'Fevereiro de 2025'
    },
    professor: {
      role: 'professor',
      roleLabel: 'Professor',
      name: 'Pedro Almeida',
      firstName: 'Pedro',
      shortName: 'Prof. Pedro',
      disciplina: 'Matemática',
      registro: 'MAT-018',
      turmas: '2º B · 3º A · 1º C',
      email: 'pedro.almeida@lordao.edu.br',
      initials: 'PA',
      since: 'Março de 2021'
    },
    secretaria: {
      role: 'secretaria',
      roleLabel: 'Secretaria',
      name: 'Ana Beatriz Lima',
      firstName: 'Ana',
      shortName: 'Ana',
      setor: 'Secretaria Escolar',
      registro: 'SEC-004',
      email: 'ana.lima@lordao.edu.br',
      initials: 'AB',
      since: 'Janeiro de 2019'
    }
  };

  var news = [
    {
      id: 'n1',
      title: 'Semana de provas do 2º bimestre',
      category: 'Aviso',
      date: '22 out 2026',
      author: 'Coordenação Pedagógica',
      readTime: '2 min de leitura',
      excerpt: 'As avaliações acontecem entre 26 e 30 de outubro. Confira o calendário por turma e os conteúdos de cada disciplina.',
      art: 'art-navy',
      icon: 'calendar',
      featured: true,
      body: [
        'As provas do 2º bimestre serão aplicadas entre os dias 26 e 30 de outubro, no horário regular das aulas. Cada turma receberá o calendário impresso e também poderá consultá-lo na Agenda do aplicativo.',
        'É importante chegar com antecedência e levar o material necessário: caneta esferográfica azul ou preta, lápis, borracha e régua. O uso de celular durante as avaliações não é permitido.',
        'Alunos com necessidades específicas devem procurar a Coordenação até sexta-feira (23) para combinarmos os ajustes necessários.'
      ]
    },
    {
      id: 'n2',
      title: 'Feira de Ciências: inscrições abertas',
      category: 'Projeto',
      date: '20 out 2026',
      author: 'Profª Melissa Rocha',
      readTime: '3 min de leitura',
      excerpt: 'Este ano o tema é “Ciência que transforma”. Monte seu grupo e inscreva seu projeto até 30 de outubro.',
      art: 'art-teal',
      icon: 'sparkle',
      featured: true,
      body: [
        'A Feira de Ciências 2026 acontecerá no dia 14 de novembro, no pátio da escola, com o tema “Ciência que transforma”. Os grupos podem ter de 2 a 4 integrantes.',
        'Os projetos devem dialogar com um dos eixos: sustentabilidade, saúde e bem-estar ou tecnologia e sociedade. As inscrições podem ser feitas com qualquer professor de Ciências da Natureza.',
        'Os três melhores trabalhos representarão a ECIT Professor Lordão na mostra regional.'
      ]
    },
    {
      id: 'n3',
      title: 'Clube de Leitura recebe novos títulos',
      category: 'Biblioteca',
      date: '16 out 2026',
      author: 'Biblioteca Escolar',
      readTime: '2 min de leitura',
      excerpt: 'Foram incorporados 42 novos livros ao acervo, com destaque para literatura brasileira contemporânea.',
      art: 'art-sand',
      icon: 'book',
      featured: true,
      body: [
        'A Biblioteca Escolar acaba de receber 42 novos títulos. Entre as novidades estão obras de Conceição Evaristo, Itamar Vieira Junior e Jarid Arraes.',
        'Os empréstimos acontecem de segunda a sexta, das 7h às 17h. Cada estudante pode levar até dois livros por 15 dias, com possibilidade de renovação.',
        'O Clube de Leitura se reúne às quartas-feiras, no contraturno, na sala 3. As inscrições seguem abertas.'
      ]
    },
    {
      id: 'n4',
      title: 'Aulão de revisão para o ENEM',
      category: 'ENEM',
      date: '14 out 2026',
      author: 'Coordenação de Área',
      readTime: '1 min de leitura',
      excerpt: 'Sábado, 31 de outubro, das 8h às 12h. Revisão de Matemática, Linguagens e Ciências Humanas.',
      art: 'art-purple',
      icon: 'graduation',
      featured: false,
      body: [
        'No dia 31 de outubro, das 8h às 12h, acontece o Aulão de Revisão ENEM no auditório. Professores de Matemática, Linguagens e Ciências Humanas conduzirão as revisões.',
        'A participação é gratuita e aberta aos estudantes do 2º e 3º anos. Haverá lista de presença e coffee break.',
        'Traga caderno e caneta. O material de apoio será disponibilizado pelo aplicativo após o aulão.'
      ]
    },
    {
      id: 'n5',
      title: 'Jogos Internos: inscrições por turma',
      category: 'Esporte',
      date: '11 out 2026',
      author: 'Educação Física',
      readTime: '2 min de leitura',
      excerpt: 'As equipes devem ser inscritas até 28 de outubro. Modalidades: futsal, vôlei, basquete e xadrez.',
      art: 'art-blue',
      icon: 'star',
      featured: false,
      body: [
        'Os Jogos Internos 2026 terão futsal, vôlei, basquete e xadrez. As inscrições das equipes vão até 28 de outubro, com os professores de Educação Física.',
        'Cada turma pode inscrever uma equipe por modalidade. Os jogos acontecem no período da manhã, entre 9 e 13 de novembro.',
        'A organização pede que cada equipe indique um capitão e um professor responsável.'
      ]
    }
  ];

  var weekDays = [
    { key: 'seg', short: 'Seg', label: 'Segunda', date: '19', month: 'out' },
    { key: 'ter', short: 'Ter', label: 'Terça', date: '20', month: 'out' },
    { key: 'qua', short: 'Qua', label: 'Quarta', date: '21', month: 'out' },
    { key: 'qui', short: 'Qui', label: 'Quinta', date: '22', month: 'out' },
    { key: 'sex', short: 'Sex', label: 'Sexta', date: '23', month: 'out' }
  ];

  function aula(time, end, subject, teacher, room, extra) {
    return Object.assign({ time: time, end: end, subject: subject, teacher: teacher, room: room }, extra || {});
  }

  var schedule = {
    seg: [
      aula('07:30', '08:20', 'portugues', 'Profª Ysllayne Costa', 'Sala 12'),
      aula('08:20', '09:10', 'matematica', 'Prof. Pedro Almeida', 'Sala 12'),
      aula('09:10', '09:30', 'intervalo', 'Intervalo', 'Pátio', { break: true }),
      aula('09:30', '10:20', 'biologia', 'Profª Melissa Rocha', 'Lab. 02'),
      aula('10:20', '11:10', 'historia', 'Prof. Kennedy Souza', 'Sala 12'),
      aula('11:10', '12:00', 'geografia', 'Prof. Sameque Dias', 'Sala 12')
    ],
    ter: [
      aula('07:30', '08:20', 'matematica', 'Prof. Pedro Almeida', 'Sala 12'),
      aula('08:20', '09:10', 'fisica', 'Prof. Kennedy Souza', 'Sala 12'),
      aula('09:10', '09:30', 'intervalo', 'Intervalo', 'Pátio', { break: true }),
      aula('09:30', '10:20', 'portugues', 'Profª Ysllayne Costa', 'Sala 12'),
      aula('10:20', '11:10', 'filosofia', 'Profª Melissa Rocha', 'Sala 12'),
      aula('11:10', '12:00', 'ingles', 'Prof. Sameque Dias', 'Sala 12')
    ],
    qua: [
      aula('07:30', '08:20', 'redacao', 'Profª Ysllayne Costa', 'Sala 12'),
      aula('08:20', '09:10', 'literatura', 'Profª Ysllayne Costa', 'Sala 12'),
      aula('09:10', '09:30', 'intervalo', 'Intervalo', 'Pátio', { break: true }),
      aula('09:30', '10:20', 'quimica', 'Profª Melissa Rocha', 'Lab. 01'),
      aula('10:20', '11:10', 'matematica', 'Prof. Pedro Almeida', 'Sala 12'),
      aula('11:10', '12:00', 'edfisica', 'Prof. Kennedy Souza', 'Quadra')
    ],
    qui: [
      aula('07:30', '08:20', 'geografia', 'Prof. Sameque Dias', 'Sala 12'),
      aula('08:20', '09:10', 'matematica', 'Prof. Pedro Almeida', 'Sala 12', { assessment: 'Revisão para a prova' }),
      aula('09:10', '09:30', 'intervalo', 'Intervalo', 'Pátio', { break: true }),
      aula('09:30', '10:20', 'biologia', 'Profª Melissa Rocha', 'Lab. 02'),
      aula('10:20', '11:10', 'historia', 'Prof. Kennedy Souza', 'Sala 12'),
      aula('11:10', '12:00', 'filosofia', 'Profª Melissa Rocha', 'Sala 12')
    ],
    sex: [
      aula('07:30', '08:20', 'portugues', 'Profª Ysllayne Costa', 'Sala 12'),
      aula('08:20', '09:10', 'matematica', 'Prof. Pedro Almeida', 'Sala 12', { assessment: 'Prova — funções' }),
      aula('09:10', '09:30', 'intervalo', 'Intervalo', 'Pátio', { break: true }),
      aula('09:30', '10:20', 'fisica', 'Prof. Kennedy Souza', 'Sala 12'),
      aula('10:20', '11:10', 'sociologia', 'Prof. Sameque Dias', 'Sala 12'),
      aula('11:10', '12:00', 'artes', 'Profª Melissa Rocha', 'Ateliê')
    ]
  };

  var activities = [
    {
      id: 'a1',
      subject: 'geografia',
      title: 'Mapa climático do Nordeste',
      teacher: 'Prof. Sameque Dias',
      due: '24 out',
      dueFull: '24 de outubro de 2026',
      status: 'pendente',
      type: 'Trabalho',
      points: '10,0',
      description: 'Construa um mapa climático da região Nordeste destacando os tipos de clima e as áreas de maior vulnerabilidade à seca. Use a legenda e a escala indicadas no roteiro anexo.',
      attachment: 'roteiro-mapa-climatico.pdf',
      attachmentSize: '820 KB'
    },
    {
      id: 'a2',
      subject: 'filosofia',
      title: 'Fichamento: Ética a Nicômaco',
      teacher: 'Profª Melissa Rocha',
      due: '27 out',
      dueFull: '27 de outubro de 2026',
      status: 'pendente',
      type: 'Fichamento',
      points: '5,0',
      description: 'Leia os capítulos I a IV do Livro II de Ética a Nicômaco e produza um fichamento de até duas páginas, relacionando o conceito de virtude com situações do cotidiano escolar.',
      attachment: 'trecho-etica-nicomaco.pdf',
      attachmentSize: '1,2 MB'
    },
    {
      id: 'a3',
      subject: 'matematica',
      title: 'Lista de exercícios — funções',
      teacher: 'Prof. Pedro Almeida',
      due: '20 out',
      dueFull: '20 de outubro de 2026',
      status: 'atrasada',
      type: 'Lista',
      points: '8,0',
      description: 'Resolva os 20 exercícios sobre função afim e função quadrática. Registre os cálculos e destaque as respostas finais. A entrega pode ser feita pelo aplicativo ou em papel.',
      attachment: 'lista-funcoes-04.pdf',
      attachmentSize: '640 KB'
    },
    {
      id: 'a4',
      subject: 'portugues',
      title: 'Resenha: O Cortiço',
      teacher: 'Profª Ysllayne Costa',
      due: '15 out',
      dueFull: '15 de outubro de 2026',
      status: 'entregue',
      type: 'Resenha',
      points: '10,0',
      grade: '9,0',
      description: 'Produza uma resenha crítica de O Cortiço, de Aluísio Azevedo, com até 30 linhas. Relacione o naturalismo à construção das personagens e ao contexto social da obra.',
      attachment: null,
      submittedAt: '14 out 2026, às 21:12'
    },
    {
      id: 'a5',
      subject: 'biologia',
      title: 'Relatório de laboratório',
      teacher: 'Profª Melissa Rocha',
      due: '29 out',
      dueFull: '29 de outubro de 2026',
      status: 'pendente',
      type: 'Relatório',
      points: '10,0',
      description: 'Registre o experimento de osmose realizado em laboratório: materiais, método, resultados observados e conclusão. Inclua as fotografias feitas durante a prática.',
      attachment: 'modelo-relatorio.pdf',
      attachmentSize: '410 KB'
    },
    {
      id: 'a6',
      subject: 'historia',
      title: 'Linha do tempo — República Velha',
      teacher: 'Prof. Kennedy Souza',
      due: '10 out',
      dueFull: '10 de outubro de 2026',
      status: 'entregue',
      type: 'Trabalho',
      points: '10,0',
      grade: '8,5',
      description: 'Organize os principais acontecimentos da República Velha (1889–1930) em uma linha do tempo comentada.',
      submittedAt: '09 out 2026, às 19:40'
    },
    {
      id: 'a7',
      subject: 'fisica',
      title: 'Problemas de cinemática',
      teacher: 'Prof. Kennedy Souza',
      due: '30 out',
      dueFull: '30 de outubro de 2026',
      status: 'pendente',
      type: 'Lista',
      points: '6,0',
      description: 'Resolva a lista de cinemática escalar, com atenção às unidades e ao sentido dos vetores.',
      attachment: 'lista-cinematica.pdf',
      attachmentSize: '380 KB'
    },
    {
      id: 'a8',
      subject: 'ingles',
      title: 'Reading comprehension — Unit 4',
      teacher: 'Prof. Sameque Dias',
      due: '09 out',
      dueFull: '09 de outubro de 2026',
      status: 'entregue',
      type: 'Atividade',
      points: '10,0',
      grade: '10,0',
      description: 'Leia o texto “The future of learning” e responda às questões de interpretação em inglês.',
      submittedAt: '08 out 2026, às 14:05'
    },
    {
      id: 'a9',
      subject: 'matematica',
      title: 'Desafio de lógica — sequências',
      teacher: 'Prof. Pedro Almeida',
      due: '05 out',
      dueFull: '05 de outubro de 2026',
      status: 'entregue',
      type: 'Desafio',
      points: '2,0',
      grade: '2,0',
      description: 'Resolva os cinco desafios de sequências numéricas publicados no mural da turma.',
      submittedAt: '04 out 2026, às 22:18'
    }
  ];

  var grades = [
    { key: 'portugues', b1: 8.5, b2: 7.5, b3: 9.0, b4: null, freq: 98 },
    { key: 'matematica', b1: 7.0, b2: 6.5, b3: 8.0, b4: null, freq: 96 },
    { key: 'biologia', b1: 9.0, b2: 8.5, b3: 9.5, b4: null, freq: 100 },
    { key: 'historia', b1: 8.0, b2: 9.0, b3: 8.5, b4: null, freq: 94 },
    { key: 'geografia', b1: 7.5, b2: 8.0, b3: 8.5, b4: null, freq: 96 },
    { key: 'filosofia', b1: 9.5, b2: 8.0, b3: 9.0, b4: null, freq: 100 },
    { key: 'fisica', b1: 6.5, b2: 7.5, b3: 7.0, b4: null, freq: 92 },
    { key: 'ingles', b1: 9.0, b2: 9.5, b3: 9.0, b4: null, freq: 100 }
  ];

  var notifications = [
    { id: 'no1', type: 'nota', icon: 'chart', title: 'Nova nota lançada', text: 'Sua média de Filosofia foi atualizada para 9,0 no 3º bimestre.', time: 'há 2 horas', unread: true, route: 'notas' },
    { id: 'no2', type: 'atividade', icon: 'tasks', title: 'Atividade próxima do prazo', text: 'O mapa climático de Geografia vence em 2 dias, no dia 24 de outubro.', time: 'há 5 horas', unread: true, route: 'atividades' },
    { id: 'no3', type: 'aviso', icon: 'calendar', title: 'Prova de Matemática na sexta', text: 'A avaliação do 2º bimestre acontece às 08h20. Conteúdos: funções afim e quadrática.', time: 'ontem', unread: true, route: 'agenda' },
    { id: 'no4', type: 'aviso', icon: 'megaphone', title: 'Notícia da escola', text: 'As inscrições para a Feira de Ciências estão abertas até 30 de outubro.', time: 'há 2 dias', unread: false, route: 'inicio' },
    { id: 'no5', type: 'frequencia', icon: 'check-circle', title: 'Frequência registrada', text: 'Sua presença nas aulas de hoje foi confirmada.', time: 'há 3 dias', unread: false, route: 'notas' },
    { id: 'no6', type: 'aviso', icon: 'users', title: 'Reunião de pais e responsáveis', text: 'A reunião do 2º bimestre acontece no dia 07 de novembro, às 9h, no auditório.', time: 'há 4 dias', unread: false, route: 'inicio' }
  ];

  var teacherNotifications = [
    { id: 'np1', type: 'atividade', icon: 'clipboard', title: 'Entregas aguardando correção', text: 'A lista 04 do 2º B tem 11 entregas para corrigir.', time: 'há 1 hora', unread: true, route: 'lancamentos' },
    { id: 'np2', type: 'aviso', icon: 'calendar', title: 'Conselho de classe', text: 'O conselho do 2º bimestre acontece na sexta-feira, às 15h, na sala dos professores.', time: 'ontem', unread: true, route: 'diario' },
    { id: 'np3', type: 'aviso', icon: 'users', title: 'Reunião com a coordenação', text: 'A coordenação enviou a pauta do encontro de segunda-feira.', time: 'há 3 dias', unread: false, route: 'turmas' }
  ];

  var secretaryNotifications = [
    { id: 'ns1', type: 'aviso', icon: 'id-card', title: 'Novo acesso pendente', text: 'Há uma solicitação de cadastro aguardando ativação.', time: 'há 3 horas', unread: true, route: 'usuarios' },
    { id: 'ns2', type: 'aviso', icon: 'megaphone', title: 'Rascunho de notícia', text: 'O calendário de novembro ainda está como rascunho.', time: 'ontem', unread: true, route: 'noticias' },
    { id: 'ns3', type: 'aviso', icon: 'calendar', title: 'Fechamento do bimestre', text: 'As notas do 2º bimestre devem ser lançadas até 30 de outubro.', time: 'há 4 dias', unread: false, route: 'turmas' }
  ];

  var teacher = {
    stats: { aulasHoje: 4, paraCorrigir: 12, turmas: 3 },
    today: [
      { time: '07:30', end: '08:20', turma: '2º B', subject: 'matematica', room: 'Sala 12', topic: 'Função afim — revisão' },
      { time: '08:20', end: '09:10', turma: '3º A', subject: 'matematica', room: 'Sala 08', topic: 'Trigonometria' },
      { time: '09:30', end: '10:20', turma: '2º B', subject: 'matematica', room: 'Sala 12', topic: 'Função quadrática' },
      { time: '13:30', end: '14:20', turma: '1º C', subject: 'matematica', room: 'Sala 05', topic: 'Conjuntos numéricos' }
    ],
    classes: [
      { id: '2b', name: '2º B', turno: 'Manhã', students: 32, media: 8.1, freq: 96, room: 'Sala 12', next: 'Hoje, 07:30', color: '#6FA8DC' },
      { id: '3a', name: '3º A', turno: 'Manhã', students: 28, media: 7.6, freq: 93, room: 'Sala 08', next: 'Hoje, 08:20', color: '#9C8FE0' },
      { id: '1c', name: '1º C', turno: 'Tarde', students: 30, media: 7.9, freq: 95, room: 'Sala 05', next: 'Hoje, 13:30', color: '#74C69D' }
    ],
    published: [
      { id: 'p1', title: 'Funções afim — lista 04', turma: '2º B', due: '24 out', delivered: 21, total: 32, status: 'aberta' },
      { id: 'p2', title: 'Trigonometria — desafio', turma: '3º A', due: '25 out', delivered: 18, total: 28, status: 'aberta' },
      { id: 'p3', title: 'Revisão para a prova', turma: '2º B', due: '22 out', delivered: 30, total: 32, status: 'corrigir' },
      { id: 'p4', title: 'Conjuntos numéricos — lista 02', turma: '1º C', due: '18 out', delivered: 27, total: 30, status: 'corrigida' }
    ],
    students: {
      '2b': [
        { name: 'Ana Júlia Ferreira', matricula: '2026-0118', b1: 8.0, b2: 7.5, b3: 8.5, b4: null },
        { name: 'Bruno Henrique Lima', matricula: '2026-0121', b1: 6.5, b2: 7.0, b3: 7.5, b4: null },
        { name: 'Camila Souza Reis', matricula: '2026-0126', b1: 9.0, b2: 8.5, b3: 9.0, b4: null },
        { name: 'Daniel Martins Alves', matricula: '2026-0129', b1: 7.0, b2: 6.5, b3: 8.0, b4: null },
        { name: 'Eduarda Nunes Rocha', matricula: '2026-0133', b1: 8.5, b2: 9.0, b3: 9.5, b4: null },
        { name: 'Felipe Andrade Dias', matricula: '2026-0137', b1: 6.0, b2: 6.5, b3: 7.0, b4: null },
        { name: 'Gabriela Costa Pinto', matricula: '2026-0139', b1: 9.5, b2: 9.0, b3: 9.5, b4: null },
        { name: 'Heitor Bezerra Luz', matricula: '2026-0141', b1: 7.5, b2: 8.0, b3: 8.0, b4: null },
        { name: 'Maria Clara Nunes', matricula: '2026-0142', b1: 7.0, b2: 6.5, b3: 8.0, b4: null },
        { name: 'Isabela Freitas Melo', matricula: '2026-0146', b1: 8.0, b2: 8.5, b3: 8.0, b4: null },
        { name: 'João Pedro Barbosa', matricula: '2026-0150', b1: 6.5, b2: 7.0, b3: 7.5, b4: null },
        { name: 'Larissa Mendes Alves', matricula: '2026-0154', b1: 9.0, b2: 9.5, b3: 9.0, b4: null }
      ],
      '3a': [
        { name: 'Alice Moreira Campos', matricula: '2025-0201', b1: 8.0, b2: 8.5, b3: 8.0, b4: null },
        { name: 'Bernardo Silva Neto', matricula: '2025-0205', b1: 7.0, b2: 7.5, b3: 7.0, b4: null },
        { name: 'Clara Ribeiro Sousa', matricula: '2025-0209', b1: 9.5, b2: 9.0, b3: 9.5, b4: null },
        { name: 'Davi Lucas Pereira', matricula: '2025-0212', b1: 6.0, b2: 6.5, b3: 7.0, b4: null },
        { name: 'Elisa Farias Gomes', matricula: '2025-0217', b1: 8.5, b2: 8.0, b3: 8.5, b4: null },
        { name: 'Fábio Nunes Correia', matricula: '2025-0220', b1: 7.5, b2: 7.0, b3: 7.5, b4: null },
        { name: 'Giovana Alves Castro', matricula: '2025-0224', b1: 9.0, b2: 8.5, b3: 9.0, b4: null },
        { name: 'Hugo Batista Lima', matricula: '2025-0228', b1: 6.5, b2: 7.5, b3: 7.0, b4: null },
        { name: 'Iara Fernandes Luz', matricula: '2025-0231', b1: 8.0, b2: 8.0, b3: 8.5, b4: null },
        { name: 'Júlia Maria Santos', matricula: '2025-0234', b1: 9.5, b2: 9.5, b3: 9.0, b4: null }
      ],
      '1c': [
        { name: 'Kaio Vinícius Braga', matricula: '2026-0301', b1: 7.0, b2: 7.5, b3: 8.0, b4: null },
        { name: 'Lara Cristina Melo', matricula: '2026-0304', b1: 8.5, b2: 8.0, b3: 8.5, b4: null },
        { name: 'Miguel Arcanjo Reis', matricula: '2026-0308', b1: 6.5, b2: 6.0, b3: 7.0, b4: null },
        { name: 'Natália Gomes Prado', matricula: '2026-0312', b1: 9.0, b2: 9.5, b3: 9.0, b4: null },
        { name: 'Otávio Luiz Farias', matricula: '2026-0316', b1: 7.5, b2: 8.0, b3: 7.5, b4: null },
        { name: 'Paula Beatriz Nunes', matricula: '2026-0319', b1: 8.0, b2: 8.5, b3: 8.0, b4: null },
        { name: 'Rafael Costa Lima', matricula: '2026-0323', b1: 6.0, b2: 6.5, b3: 7.5, b4: null },
        { name: 'Sofia Almeida Rocha', matricula: '2026-0327', b1: 9.5, b2: 9.0, b3: 9.5, b4: null },
        { name: 'Thiago Bezerra Dias', matricula: '2026-0331', b1: 8.0, b2: 7.5, b3: 8.0, b4: null },
        { name: 'Vitória Mendes Luz', matricula: '2026-0335', b1: 8.5, b2: 9.0, b3: 8.5, b4: null }
      ]
    }
  };

  var secretary = {
    stats: { classes: 24, students: 780, teachers: 42, news: 6 },
    classes: [
      { id: '1a', name: '1º A', turno: 'Manhã', students: 32, teacher: 'Ysllayne Costa', status: 'Ativa' },
      { id: '1b', name: '1º B', turno: 'Manhã', students: 31, teacher: 'Kennedy Souza', status: 'Ativa' },
      { id: '1c', name: '1º C', turno: 'Tarde', students: 30, teacher: 'Pedro Almeida', status: 'Ativa' },
      { id: '2a', name: '2º A', turno: 'Manhã', students: 33, teacher: 'Melissa Rocha', status: 'Ativa' },
      { id: '2b', name: '2º B', turno: 'Manhã', students: 32, teacher: 'Pedro Almeida', status: 'Ativa' },
      { id: '2c', name: '2º C', turno: 'Tarde', students: 30, teacher: 'Sameque Dias', status: 'Ativa' },
      { id: '3a', name: '3º A', turno: 'Manhã', students: 28, teacher: 'Pedro Almeida', status: 'Ativa' },
      { id: '3b', name: '3º B', turno: 'Tarde', students: 29, teacher: 'Ysllayne Costa', status: 'Ativa' }
    ],
    accounts: [
      { name: 'Maria Clara Nunes', login: 'maria.nunes', role: 'Aluno', turma: '2º B', status: 'Ativo', created: '12 fev 2026' },
      { name: 'Pedro Almeida', login: 'pedro.almeida', role: 'Professor', turma: '—', status: 'Ativo', created: '03 fev 2026' },
      { name: 'Ysllayne Costa', login: 'ysllayne.costa', role: 'Professor', turma: '—', status: 'Ativo', created: '03 fev 2026' },
      { name: 'Kennedy Souza', login: 'kennedy.souza', role: 'Professor', turma: '—', status: 'Ativo', created: '04 fev 2026' },
      { name: 'Melissa Rocha', login: 'melissa.rocha', role: 'Professor', turma: '—', status: 'Ativo', created: '04 fev 2026' },
      { name: 'Sameque Dias', login: 'sameque.dias', role: 'Professor', turma: '—', status: 'Ativo', created: '05 fev 2026' },
      { name: 'João Vitor Freitas', login: 'joao.freitas', role: 'Aluno', turma: '1º A', status: 'Pendente', created: '20 out 2026' },
      { name: 'Ana Beatriz Lima', login: 'ana.lima', role: 'Secretaria', turma: '—', status: 'Ativo', created: '08 jan 2026' }
    ],
    newsManaged: [
      { id: 'n1', title: 'Semana de provas do 2º bimestre', category: 'Aviso', status: 'Publicada', date: '22 out 2026', author: 'Coordenação' },
      { id: 'n2', title: 'Feira de Ciências: inscrições abertas', category: 'Projeto', status: 'Publicada', date: '20 out 2026', author: 'Melissa Rocha' },
      { id: 'n3', title: 'Clube de Leitura recebe novos títulos', category: 'Biblioteca', status: 'Publicada', date: '16 out 2026', author: 'Biblioteca' },
      { id: 'n4', title: 'Aulão de revisão para o ENEM', category: 'ENEM', status: 'Publicada', date: '14 out 2026', author: 'Coordenação' },
      { id: 'n5', title: 'Jogos Internos: inscrições por turma', category: 'Esporte', status: 'Publicada', date: '11 out 2026', author: 'Ed. Física' },
      { id: 'n6', title: 'Calendário de novembro', category: 'Aviso', status: 'Rascunho', date: '—', author: 'Secretaria' }
    ],
    recentLogins: [
      { name: 'Maria Clara Nunes', turma: '2º B', time: 'há 12 min' },
      { name: 'João Vitor Freitas', turma: '1º A', time: 'há 1 h' },
      { name: 'Pedro Almeida', turma: 'Professor', time: 'há 2 h' }
    ]
  };

  var quickLinks = {
    aluno: [
      { route: 'agenda', icon: 'calendar', title: 'Agenda', text: 'Aulas e horários da semana' },
      { route: 'atividades', icon: 'tasks', title: 'Atividades', text: 'Prazos e entregas pendentes' },
      { route: 'notas', icon: 'chart', title: 'Notas', text: 'Boletim e frequência' },
      { route: 'notificacoes', icon: 'bell', title: 'Notificações', text: 'Avisos importantes da escola' }
    ],
    professor: [
      { route: 'turmas', icon: 'users', title: 'Turmas', text: 'Estudantes e desempenho' },
      { route: 'lancamentos', icon: 'clipboard', title: 'Atividades', text: 'Publicar e corrigir' },
      { route: 'diario', icon: 'edit', title: 'Diário', text: 'Notas e frequência' },
      { route: 'notificacoes', icon: 'bell', title: 'Notificações', text: 'Avisos da coordenação' }
    ],
    secretaria: [
      { route: 'turmas', icon: 'users', title: 'Turmas', text: 'Organização das classes' },
      { route: 'usuarios', icon: 'id-card', title: 'Usuários', text: 'Logins de alunos e professores' },
      { route: 'noticias', icon: 'megaphone', title: 'Notícias', text: 'Comunicados da escola' },
      { route: 'notificacoes', icon: 'bell', title: 'Notificações', text: 'Solicitações e avisos' }
    ]
  };

  window.LordaoData = {
    school: {
      name: 'ECIT Professor Lordão',
      app: 'Lordão Academic',
      tagline: 'Conforto e acolhimento',
      year: '2026',
      city: 'Bayeux · Paraíba'
    },
    users: users,
    news: news,
    weekDays: weekDays,
    schedule: schedule,
    subjects: subjects,
    activities: activities,
    grades: grades,
    notifications: notifications,
    teacherNotifications: teacherNotifications,
    secretaryNotifications: secretaryNotifications,
    teacher: teacher,
    secretary: secretary,
    quickLinks: quickLinks
  };
})();
