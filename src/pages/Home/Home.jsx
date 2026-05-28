import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import StatCard from '../../components/StatCard/StatCard';
import NewsCard from '../../components/NewsCard/NewsCard';
import BirthdayList from '../../components/BirthdayList/BirthdayList';
import { MdClose, MdCake } from 'react-icons/md';
import styles from './Home.module.css';
import InteractiveMap from '../../components/InteractiveMap/InteractiveMap';

const banners = [
  {
    id: 1,
    text: 'XVI CONGRESSO DA CNHP',
    subheadline: 'Confira o Resumo Oficial: Destaques, comissões e os rumos definidos em nosso encontro.',
    ctaText: 'Baixar Boletim Completo',
    gradient: 'linear-gradient(135deg, #1B5E20 0%, #0D47A1 100%)',
    url: 'https://online.fliphtml5.com/CNHP2026/XVI-BOLETIM-INFORMATIVO/#p=1',
    pdfUrl: 'https://online.fliphtml5.com/CNHP2026/XVI-BOLETIM-INFORMATIVO/#p=1',
  },
  {
    id: 2,
    text: 'CLIQUE AQUI E CONHEÇA A NOVA Revista da UPH',
    gradient: 'linear-gradient(135deg, #1B5E20 0%, #0D47A1 100%)',
    url: 'https://www.uph.org.br/revista-da-uph', // <-- Revista UPH
  },
  {
    id: 3,
    text: 'VISITE O SITE OFICIAL DA UPH',
    gradient: 'linear-gradient(135deg, #0D47A1 0%, #1B5E20 100%)',
    url: 'https://www.uph.org.br', // <-- Insira o link externo aqui
  },
];

const regionGradients = {
  'Norte I': 'linear-gradient(135deg, #009688 0%, #004D40 100%)',      // Verde Esmeralda/Teal (Norte)
  'Norte II': 'linear-gradient(135deg, #4CAF50 0%, #1B5E20 100%)',     // Verde Floresta (Norte)
  'Nordeste': 'linear-gradient(135deg, #FF5722 0%, #BF360C 100%)',     // Laranja-Vermelho Quente (Nordeste)
  'Centro-Oeste': 'linear-gradient(135deg, #FFC107 0%, #E65100 100%)', // Dourado/Amarelo Cerrado (Centro-Oeste)
  'Sul': 'linear-gradient(135deg, #880E4F 0%, #4A001F 100%)',          // Vinho/Borgonha (Sul)
  'Sudeste I': 'linear-gradient(135deg, #2196F3 0%, #0D47A1 100%)',    // Azul Royal/Marinho (Sudeste)
  'Sudeste II': 'linear-gradient(135deg, #00BCD4 0%, #006064 100%)',   // Azul Ciano/Turquesa Escuro (Sudeste)
};

export default function Home() {
  const navigate = useNavigate();
  const [bannersList, setBannersList] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [noticiasData, setNoticiasData] = useState([]);
  const [aniversariantes, setAniversariantes] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('secnhp_banners_v3');
    if (saved) {
      setBannersList(JSON.parse(saved));
    } else {
      setBannersList(banners);
      localStorage.setItem('secnhp_banners_v3', JSON.stringify(banners));
    }
  }, []);
  const [regioes, setRegioes] = useState([]);
  const [stats, setStats] = useState({ sinodaisAtivas: 0, sinodaisInativas: 0, federacoes: 0, uphs: 0, socios: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states for stats detail drill-down
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');

  const handleOpenModal = async (type) => {
    setShowModal(true);
    setModalLoading(true);
    setModalData([]);
    setModalSearch('');
    
    try {
      if (type === 'ativas') {
        setModalTitle('Sinodais Ativas');
        const { data, error } = await supabase
          .from('sinodais')
          .select('*, regioes(nome)')
          .eq('situacao', 'ativa')
          .order('nome');
        if (error) throw error;
        setModalData((data || []).map(s => ({
          title: `${s.sigla} - ${s.nome}`,
          subtitle: `Região: ${s.regioes?.nome || 'N/A'}`
        })));
      } else if (type === 'inativas') {
        setModalTitle('Sinodais Inativas');
        const { data, error } = await supabase
          .from('sinodais')
          .select('*, regioes(nome)')
          .eq('situacao', 'inativa')
          .order('nome');
        if (error) throw error;
        setModalData((data || []).map(s => ({
          title: `${s.sigla} - ${s.nome}`,
          subtitle: `Região: ${s.regioes?.nome || 'N/A'}`
        })));
      } else if (type === 'federacoes') {
        setModalTitle('Federações');
        const { data, error } = await supabase
          .from('federacoes')
          .select('*, sinodais(sigla)')
          .order('nome');
        if (error) throw error;
        setModalData((data || []).map(f => ({
          title: `${f.sigla} - ${f.nome}`,
          subtitle: `Sinodal: ${f.sinodais?.sigla || 'N/A'} | Mandato: ${f.inicio_mandato || 'N/A'} - ${f.fim_mandato || 'N/A'}`
        })));
      } else if (type === 'uphs') {
        setModalTitle('UPHs');
        const { data, error } = await supabase
          .from('uphs')
          .select('*, federacoes(sigla)')
          .order('nome_igreja');
        if (error) throw error;
        setModalData((data || []).map(u => ({
          title: u.nome_igreja,
          subtitle: `Federação: ${u.federacoes?.sigla || 'N/A'}`,
          badge: `${u.numero_socios || 0} sócios`
        })));
      } else if (type === 'socios') {
        setModalTitle('Sócios por UPH');
        const { data, error } = await supabase
          .from('uphs')
          .select('*, federacoes(sigla)')
          .gt('numero_socios', 0)
          .order('numero_socios', { ascending: false });
        if (error) throw error;
        setModalData((data || []).map(u => ({
          title: u.nome_igreja,
          subtitle: `Federação: ${u.federacoes?.sigla || 'N/A'}`,
          badge: `${u.numero_socios || 0} sócios`
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const nextBanner = useCallback(() => {
    setCurrentBanner((prev) => (prev + 1) % (bannersList.length || banners.length));
  }, [bannersList]);

  useEffect(() => {
    const timer = setInterval(nextBanner, 4000);
    return () => clearInterval(timer);
  }, [nextBanner]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const { data: fetchedNoticias, error: noticiasError } = await supabase
          .from('noticias')
          .select('*')
          .order('data_publicacao', { ascending: false })
          .limit(5);

        if (noticiasError) throw noticiasError;
        setNoticiasData(fetchedNoticias || []);

        const { count: activeCount, error: activeError } = await supabase
          .from('sinodais')
          .select('id', { count: 'exact' })
          .eq('situacao', 'ativa');
        if (activeError) throw activeError;

        const { count: inactiveCount, error: inactiveError } = await supabase
          .from('sinodais')
          .select('id', { count: 'exact' })
          .eq('situacao', 'inativa');
        if (inactiveError) throw inactiveError;

        const { count: federacoesCount, error: federacoesError } = await supabase
          .from('federacoes')
          .select('id', { count: 'exact' });
        if (federacoesError) throw federacoesError;

        const { count: uphsCount, error: uphsError } = await supabase
          .from('uphs')
          .select('id', { count: 'exact' });
        if (uphsError) throw uphsError;

        const { data: uphsData, error: sociosError } = await supabase
          .from('uphs')
          .select('numero_socios');
        if (sociosError) throw sociosError;

        const sociosSum = uphsData?.reduce((acc, curr) => acc + (curr.numero_socios || 0), 0) || 0;

        // Fetch regions list from Supabase
        const { data: dbRegioes, error: regioesError } = await supabase
          .from('regioes')
          .select('*');
        if (regioesError) throw regioesError;

        let sortedRegioes = [];
        if (dbRegioes) {
          const customOrder = ['Norte I', 'Norte II', 'Nordeste', 'Centro-Oeste', 'Sul', 'Sudeste I', 'Sudeste II'];
          sortedRegioes = [...dbRegioes].sort((a, b) => {
            const indexA = customOrder.indexOf(a.nome);
            const indexB = customOrder.indexOf(b.nome);
            return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
          });
        }

        // Fetch aniversariantes do mês from 'membros_diretoria'
        const { data: membrosData, error: membrosError } = await supabase
          .from('membros_diretoria')
          .select('*')
          .not('data_nascimento', 'is', null);
        
        if (membrosError) throw membrosError;

        // Fetch aniversariantes do mês from public.aniversariantes (imported from Google Agenda)
        let googleAniversariantes = [];
        try {
          const { data: agendaData, error: agendaError } = await supabase
            .from('aniversariantes')
            .select('*')
            .not('data_nascimento', 'is', null);
          if (!agendaError && agendaData) {
            googleAniversariantes = agendaData;
          }
        } catch (err) {
          console.warn('Tabela aniversariantes ainda não criada ou inacessível:', err);
        }

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();
        
        const parseDayAndFilter = (list) => {
          return list?.filter(m => {
            if (!m.data_nascimento) return false;
            const parts = m.data_nascimento.split('-');
            if (parts.length < 3) return false;
            const [, month, day] = parts;
            return parseInt(month, 10) - 1 === currentMonth && parseInt(day, 10) === currentDay;
          }) || [];
        };

        const aniversariantesDiaMembros = parseDayAndFilter(membrosData);
        const aniversariantesDiaGoogle = parseDayAndFilter(googleAniversariantes);

        // Fetch all directors to cross-reference and enrich birthdays
        const { data: todosDiretores } = await supabase
          .from('membros_diretoria')
          .select('*');

        // Helper to normalize names for comparison
        const normalizeName = (name) => {
          if (!name) return '';
          return name.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // remove accents
            .replace(/^(presb\.|diac\.|rev\.)\s+/i, '') // remove titles
            .trim();
        };

        // Combine and enrich birthdays
        const enrichedGoogle = aniversariantesDiaGoogle.map(item => {
          const normalizedItemName = normalizeName(item.nome);
          // Find matching director
          const directorMatch = todosDiretores?.find(d => normalizeName(d.nome) === normalizedItemName);
          
          return {
            id: item.id,
            nome: directorMatch ? directorMatch.nome : item.nome,
            data_nascimento: item.data_nascimento,
            telefone: directorMatch ? directorMatch.telefone : (item.telefone || null),
            whatsapp: directorMatch ? directorMatch.whatsapp : (item.whatsapp || false),
            foto_url: directorMatch ? (directorMatch.foto_url || directorMatch.foto) : (item.foto_url || null),
            cargo: directorMatch ? directorMatch.cargo : null
          };
        });

        // Combine both
        const combinedAniversariantes = [
          ...aniversariantesDiaMembros.map(m => ({
            id: m.id,
            nome: m.nome,
            data_nascimento: m.data_nascimento,
            telefone: m.telefone,
            whatsapp: m.whatsapp,
            foto_url: m.foto_url || m.foto,
            cargo: m.cargo
          })),
          ...enrichedGoogle
        ];

        // Deduplicate by normalized name
        const uniqueAniversariantes = [];
        const seenNames = new Set();
        for (const item of combinedAniversariantes) {
          const norm = normalizeName(item.nome);
          if (!seenNames.has(norm)) {
            seenNames.add(norm);
            uniqueAniversariantes.push(item);
          }
        }

        setAniversariantes(uniqueAniversariantes);

        setStats({
          sinodaisAtivas: activeCount || 0,
          sinodaisInativas: inactiveCount || 0,
          federacoes: federacoesCount || 0,
          uphs: uphsCount || 0,
          socios: sociosSum
        });

        setRegioes(sortedRegioes);

      } catch (err) {
        console.error('Error fetching Home data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);



  return (
    <div className={styles.page}>
      
      {/* 1. Full-Width Banner Carousel */}
      <div className={styles.bannerSection}>
        <div className={styles.bannerTrack}>
          {(bannersList.length > 0 ? bannersList : banners).map((banner, index) => (
            <div
              key={banner.id}
              className={`${styles.banner} ${
                index === currentBanner ? styles.bannerActive : ''
              }`}
              style={{ 
                background: banner.imageUrl 
                  ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${banner.imageUrl}) center/cover no-repeat` 
                  : banner.gradient 
              }}
              onClick={() => banner.url && window.open(banner.url, '_blank')}
            >
              <div className={styles.bannerContent}>
                <h2 className={styles.bannerHeadline}>{banner.text}</h2>
                {banner.subheadline && (
                  <p className={styles.bannerSubheadline}>{banner.subheadline}</p>
                )}
                {banner.ctaText && (
                  <button 
                    className={styles.bannerCta}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the main banner click
                      const targetLink = banner.pdfUrl || banner.url;
                      if (targetLink && targetLink !== '#') {
                        window.open(targetLink, '_blank');
                      }
                    }}
                  >
                    {banner.ctaText}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.dots}>
          {(bannersList.length > 0 ? bannersList : banners).map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${
                index === currentBanner ? styles.dotActive : ''
              }`}
              onClick={() => setCurrentBanner(index)}
              aria-label={`Banner ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Columns Layout (Grid on Desktop, Stack on Mobile) */}
      <div className={styles.columnsContainer}>
        {/* Left/Center Column: Map, Stats, News */}
        <div className={styles.mainContent}>
          {/* Regions Map Section */}
          <section className={styles.section}>
            <InteractiveMap 
              onRegionClick={(reg) => navigate('/consultar-sinodais', { state: { initialRegion: reg } })}
            />
          </section>

          {/* Statistics Section */}
          <section className={styles.section} style={{ marginTop: '16px' }}>
            <h2 className={styles.sectionTitle}>Estatísticas</h2>
            {loading ? (
              <p style={{ padding: '0 1.5rem' }}>Carregando...</p>
            ) : error ? (
              <p style={{ padding: '0 1.5rem', color: 'red' }}>Erro ao carregar dados.</p>
            ) : (
              <div className={styles.statsRow}>
                <StatCard
                  label="Sinodais - Ativas"
                  value={stats.sinodaisAtivas}
                  variant="dark"
                  onClick={() => handleOpenModal('ativas')}
                />
                <StatCard
                  label="Sinodais - Inativas"
                  value={stats.sinodaisInativas}
                  variant="inactive"
                  onClick={() => handleOpenModal('inativas')}
                />
                <StatCard
                  label="Feds."
                  value={stats.federacoes}
                  variant="medium"
                  onClick={() => handleOpenModal('federacoes')}
                />
                <StatCard
                  label="UPHs"
                  value={stats.uphs}
                  variant="olive"
                  onClick={() => handleOpenModal('uphs')}
                />
                <StatCard
                  label="Sócios"
                  value={stats.socios}
                  variant="green"
                  onClick={() => handleOpenModal('socios')}
                />
              </div>
            )}
          </section>

          {/* Latest News Section */}
          <section className={styles.section} style={{ marginTop: '16px' }}>
            <h2 className={styles.sectionTitle}>Últimas notícias</h2>
            {loading ? (
              <p style={{ padding: '0 1.5rem' }}>Carregando...</p>
            ) : error ? (
              <p style={{ padding: '0 1.5rem', color: 'red' }}>Erro ao carregar dados.</p>
            ) : (
              <div className={styles.newsScroll}>
                {noticiasData.map((noticia) => (
                  <NewsCard
                    key={noticia.id}
                    titulo={noticia.titulo}
                    data={noticia.data_publicacao || noticia.data}
                    imagem={noticia.imagem_url || noticia.imagem}
                    variant="horizontal"
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Aniversariantes do Dia */}
        <div className={styles.sideContent}>
          {/* Aniversariantes Section */}
          <section className={styles.section} style={{ marginBottom: '2rem' }}>
            <h2 className={styles.sectionTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdCake size={22} style={{ color: 'var(--color-primary)' }} />
              Aniversariantes do Dia
            </h2>
            {loading ? (
              <p>Carregando...</p>
            ) : error ? (
              <p style={{ color: 'red' }}>Erro ao carregar dados.</p>
            ) : (
              <BirthdayList membros={aniversariantes} />
            )}
          </section>
        </div>
      </div>

      {/* Dynamic Drill-down Modal overlay */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{modalTitle}</h3>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <MdClose size={22} />
              </button>
            </div>

            {/* Search Bar */}
            {!modalLoading && modalData.length > 0 && (
              <div className={styles.modalSearchContainer}>
                <span className={styles.modalSearchIcon}>🔍</span>
                <input
                  type="text"
                  className={styles.modalSearchInput}
                  placeholder="Pesquisar..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  autoFocus
                />
                {modalSearch && (
                  <button
                    className={styles.modalSearchClear}
                    onClick={() => setModalSearch('')}
                    aria-label="Limpar pesquisa"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            <div className={styles.modalBody}>
              {modalLoading ? (
                <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando dados...</p>
              ) : (() => {
                const filtered = modalData.filter(
                  (item) =>
                    (item.title || '').toLowerCase().includes(modalSearch.toLowerCase()) ||
                    (item.subtitle || '').toLowerCase().includes(modalSearch.toLowerCase())
                );
                if (filtered.length === 0) {
                  return (
                    <p style={{ textAlign: 'center', padding: '2rem', color: '#666666' }}>
                      Nenhum resultado para "{modalSearch}".
                    </p>
                  );
                }
                return filtered.map((item, index) => (
                  <div key={index} className={styles.modalItem}>
                    <div className={styles.modalItemHeader}>
                      <span className={styles.modalItemTitle}>{item.title}</span>
                      {item.badge && <span className={styles.modalItemBadge}>{item.badge}</span>}
                    </div>
                    <span className={styles.modalItemSubtitle}>{item.subtitle}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
