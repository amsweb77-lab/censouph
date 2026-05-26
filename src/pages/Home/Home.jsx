import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import StatCard from '../../components/StatCard/StatCard';
import NewsCard from '../../components/NewsCard/NewsCard';
import BirthdayList from '../../components/BirthdayList/BirthdayList';
import styles from './Home.module.css';

const banners = [
  {
    id: 1,
    text: 'CLIQUE AQUI E CONHEÇA A NOVA Revista da UPH',
    gradient: 'linear-gradient(135deg, #1B5E20 0%, #0D47A1 100%)',
  },
  {
    id: 2,
    text: 'CONGRESSO NACIONAL UPH 2026 - INSCREVA-SE',
    gradient: 'linear-gradient(135deg, #0D47A1 0%, #1B5E20 100%)',
  },
];

export default function Home() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [noticiasData, setNoticiasData] = useState([]);
  const [aniversariantes, setAniversariantes] = useState([]);
  const [stats, setStats] = useState({ sinodais: 0, federacoes: 0, uphs: 0, socios: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const nextBanner = useCallback(() => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  }, []);

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

        const { count: sinodaisCount, error: sinodaisError } = await supabase
          .from('sinodais')
          .select('id', { count: 'exact' });
        if (sinodaisError) throw sinodaisError;

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

        const currentMonth = new Date().getMonth();
        
        const parseMonthAndFilter = (list) => {
          return list?.filter(m => {
            if (!m.data_nascimento) return false;
            const [, month] = m.data_nascimento.split('-');
            return parseInt(month, 10) - 1 === currentMonth;
          }) || [];
        };

        const aniversariantesMesMembros = parseMonthAndFilter(membrosData);
        const aniversariantesMesGoogle = parseMonthAndFilter(googleAniversariantes);

        // Combine both lists
        const combinedAniversariantes = [
          ...aniversariantesMesMembros,
          ...aniversariantesMesGoogle.map(item => ({
            id: item.id,
            nome: item.nome,
            data_nascimento: item.data_nascimento,
            telefone: item.telefone || null,
            whatsapp: item.whatsapp || false,
            foto_url: item.foto_url || null
          }))
        ];

        setAniversariantes(combinedAniversariantes);

        setStats({
          sinodais: sinodaisCount || 0,
          federacoes: federacoesCount || 0,
          uphs: uphsCount || 0,
          socios: sociosSum
        });

      } catch (err) {
        console.error('Error fetching Home data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const scrollToMap = () => {
    const mapElement = document.getElementById('map-section');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.page}>
      {/* Logo Bar */}
      <div className={styles.logoBar}>
        <img src="/logo.png" alt="Logo UPH" className={styles.logoImage} />
      </div>

      {/* Banner Carousel */}
      <div className={styles.bannerSection}>
        <div className={styles.bannerTrack}>
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`${styles.banner} ${
                index === currentBanner ? styles.bannerActive : ''
              }`}
              style={{ background: banner.gradient }}
            >
              <p className={styles.bannerText}>{banner.text}</p>
            </div>
          ))}
        </div>
        <div className={styles.dots}>
          {banners.map((_, index) => (
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

      {/* Statistics Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Estatísticas</h2>
        {loading ? (
          <p style={{ padding: '0 1.5rem' }}>Carregando...</p>
        ) : error ? (
          <p style={{ padding: '0 1.5rem', color: 'red' }}>Erro ao carregar dados.</p>
        ) : (
          <div className={styles.statsRow}>
            <StatCard
              label="Sinodais"
              value={stats.sinodais}
              variant="dark"
              onClick={scrollToMap}
            />
            <StatCard
              label="Feds."
              value={stats.federacoes}
              variant="medium"
              onClick={scrollToMap}
            />
            <StatCard
              label="UPHs"
              value={stats.uphs}
              variant="olive"
              onClick={scrollToMap}
            />
            <StatCard
              label="Sócios"
              value={stats.socios}
              variant="green"
              onClick={scrollToMap}
            />
          </div>
        )}
      </section>

      {/* Latest News Section */}
      <section className={styles.section}>
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

      {/* Aniversariantes Section */}
      <section className={styles.section} style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
        <h2 className={styles.sectionTitle}>Aniversariantes do Mês</h2>
        {loading ? (
          <p>Carregando...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>Erro ao carregar dados.</p>
        ) : (
          <BirthdayList membros={aniversariantes} />
        )}
      </section>

      {/* Mapa Geral Section */}
      <section id="map-section" className={styles.section} style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
        <h2 className={styles.sectionTitle}>IPB no Brasil</h2>
        <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginTop: '8px' }}>
          <iframe 
            src="https://www.icalvinus.app/ipb-no-brasil/mapa-geral/" 
            title="Mapa Geral IPB"
            allowFullScreen
            loading="lazy"
            style={{ width: '100%', height: '100%', border: 'none' }}
          ></iframe>
        </div>
      </section>
    </div>
  );
}
