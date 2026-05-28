/* Dados mockados para desenvolvimento local do SECNHP */

export const estatisticasNacionais = {
  sinodais: 68,
  federacoes: 352,
  uphs: 319,
  socios: 4923,
};

export const diretoriaCNHP = {
  titulo: 'CONFEDERAÇÃO NACIONAL DE HOMENS PRESBITERIANOS',
  subtitulo: '- DIRETORIA CNHP -',
  mandato: '2026 - 2030',
  membros: [
    {
      id: '1',
      cargo: 'Presidente',
      nome: 'Presb. Luiz Augusto Gonzaga',
      telefone: '(11) 99271-1135',
      email: 'presidente.cnhp@gmail.com',
      foto: '/membros/gonzaga.png',
    },
    {
      id: '2',
      cargo: 'Vice-Presidente Norte I',
      nome: 'Diác. Jefferson Wuillian Ribeiro',
      telefone: '(69) 99248-0054',
      email: 'jeffersoncacoalrondonia@hotmail.com',
      foto: '/membros/jefferson.png',
    },
    {
      id: '3',
      cargo: 'Vice-Presidente Norte II',
      nome: 'Presb. Moacir de Freitas Heringer',
      telefone: '(92) 98415-0033',
      email: 'moacirheringer@gmail.com',
      foto: '/membros/moacir.png',
    },
    {
      id: '4',
      cargo: 'Vice-Presidente Nordeste',
      nome: 'Presb. Francisco Martins da Silva',
      telefone: '(85) 99646-1234',
      email: 'irmaomartins12@gmail.com',
      foto: '/membros/francisco.png',
    },
    {
      id: '5',
      cargo: 'Vice-Presidente Centro-Oeste',
      nome: 'Presb. Marco Rodrigues de Sousa (Marcão)',
      telefone: '(61) 99123-4567',
      email: 'marco_r_sousa@yahoo.com.br',
      foto: '/membros/marcao.png',
    },
    {
      id: '6',
      cargo: 'Vice-Presidente Sul',
      nome: 'Presb. Edson Oliveira dos Anjos',
      telefone: '(44) 99876-5432',
      email: 'anjoliveiraeoa@hotmail.com',
      foto: '/membros/edson.png',
    },
    {
      id: '7',
      cargo: 'Vice-Presidente Sudeste I',
      nome: 'Presb. Rewerson Fugikawa de Salles',
      telefone: '(11) 98765-4321',
      email: 'rfugikawa@yahoo.com.br',
      foto: '/membros/rewerson.png',
    },
    {
      id: '8',
      cargo: 'Vice-Presidente Sudeste II',
      nome: 'Presb. Samuel Ribeiro da Silva',
      telefone: '(21) 97654-3210',
      email: 'samribs@yahoo.com.br',
      foto: '/membros/samuel.png',
    },
    {
      id: '9',
      cargo: 'Secretário Executivo',
      nome: 'Presb. Adrivanderson Martins Santos',
      telefone: '(98) 99999-8888',
      email: 'sec.executivo@uph.org.br',
      foto: '/membros/adrivanderson.png',
    },
    {
      id: '10',
      cargo: 'Primeiro Secretário',
      nome: 'Diác. Marcelo Luciano da Costa Santos',
      telefone: '(31) 98888-7777',
      email: 'marcelo.matipo@gmail.com',
      foto: '/membros/marcelo.png',
    },
    {
      id: '11',
      cargo: 'Segundo Secretário',
      nome: 'Presb. Saint’ Clair Cidreira Junior',
      telefone: '(68) 99912-3456',
      email: 'saintjr79@gmail.com',
      foto: '/membros/saint.png',
    },
    {
      id: '12',
      cargo: 'Tesoureiro',
      nome: 'Presb. Marcus José Gomes Costa',
      telefone: '(61) 98877-6655',
      email: 'marcuscosta.cnhp@gmail.com',
      foto: '/membros/marcus.png',
    },
    {
      id: '13',
      cargo: 'Secretário Nacional',
      nome: 'Presb. Paulo Roberto da Silveira Daflon',
      telefone: '(21) 98888-9999',
      email: 'secretario.nacional@uph.org.br',
      foto: '/membros/daflon.png',
    },
  ],
};

export const noticias = [
  {
    id: '1',
    titulo: 'Congresso Nacional da Mocidade termina em Recife com renovação de lideranças e espírito de unidade',
    data: '03/05/2026',
    imagem: 'https://picsum.photos/seed/news1/300/200',
  },
  {
    id: '2',
    titulo: 'Federação de Homens de Irecê promove encontro marcante em Lapão',
    data: '03/05/2026',
    imagem: 'https://picsum.photos/seed/news2/300/200',
  },
  {
    id: '3',
    titulo: 'UPH de Aracaju promove encontro de homens',
    data: '02/05/2026',
    imagem: 'https://picsum.photos/seed/news3/300/200',
  },
  {
    id: '4',
    titulo: 'Diretoria 2026 da Federação Rumo ao Sertão',
    data: '02/05/2026',
    imagem: 'https://picsum.photos/seed/news4/300/200',
  },
  {
    id: '5',
    titulo: 'Federação de Garanhuns promove caminhada evangelística',
    data: '01/05/2026',
    imagem: 'https://picsum.photos/seed/news5/300/200',
  },
  {
    id: '6',
    titulo: 'Nordeste em Missão: UPH avança na implantação de novos grupos',
    data: '28/04/2026',
    imagem: 'https://picsum.photos/seed/news6/300/200',
  },
];

export const downloads = [
  { id: '1', titulo: 'Manual Presbiteriano 2024 - Com Notas Remissivas', tipo: 'pdf' },
  { id: '2', titulo: 'Folder Plantação de Igrejas', tipo: 'pdf' },
  { id: '3', titulo: 'Folder Pai de Oração', tipo: 'pdf' },
  { id: '4', titulo: 'Folder Homens de Oração', tipo: 'pdf' },
  { id: '5', titulo: 'Folder Homem Levanta e Clama', tipo: 'pdf' },
  { id: '6', titulo: 'Folder Culto Doméstico', tipo: 'pdf' },
  { id: '7', titulo: 'Cartilha UPH em Ação', tipo: 'pdf' },
  { id: '8', titulo: 'Cartilha da UPH', tipo: 'pdf' },
  { id: '9', titulo: 'Cartilha da Evangelização UPH', tipo: 'pdf' },
  { id: '10', titulo: 'UPH 60 anos de histórias, por Presb. Paulo Daflon', tipo: 'pdf' },
];

export const regioes = [
  'Norte I',
  'Norte II',
  'Nordeste',
  'Centro-Oeste',
  'Sul',
  'Sudeste I',
  'Sudeste II',
];

export const menuItems = {
  estatisticas: [
    { label: 'Consultar Sinodais', path: '/consultar-sinodais' },
    { label: 'Consultar Federações', path: '/consultar-federacoes' },
    { label: 'Consultar UPHs', path: '/consultar-uphs' },
  ],
  cadastros: [
    { label: 'Cadastrar Sinodais', path: '/cadastrar-sinodais', disabled: true },
    { label: 'Cadastrar Federações', path: '/cadastrar-federacoes' },
    { label: 'Cadastrar UPHs', path: '/cadastrar-uphs' },
    { label: 'Cadastrar Diretorias', path: '/cadastrar-diretorias' },
    { label: 'Gerenciar Banners', path: '/gerenciar-banners' },
  ],
};
