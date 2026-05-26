import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import NewsCard from '../../components/NewsCard/NewsCard';
import styles from './Noticias.module.css';

export default function Noticias() {
  const [noticiasData, setNoticiasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchNoticias() {
      try {
        setLoading(true);
        setError(null);
        const { data, error: fetchError } = await supabase
          .from('noticias')
          .select('*')
          .order('data_publicacao', { ascending: false });

        if (fetchError) throw fetchError;
        setNoticiasData(data || []);
      } catch (err) {
        console.error('Error fetching Noticias:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticias();
  }, []);

  return (
    <div className={styles.page}>
      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</p>
      ) : error ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Erro ao carregar notícias.</p>
      ) : (
        <div className={styles.list}>
          {noticiasData.map((noticia, index) => (
            <div
              key={noticia.id}
              className={styles.cardWrap}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <NewsCard
                titulo={noticia.titulo}
                data={noticia.data_publicacao || noticia.data}
                imagem={noticia.imagem_url || noticia.imagem}
                variant="list"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
