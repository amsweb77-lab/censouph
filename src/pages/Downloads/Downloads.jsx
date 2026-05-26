import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import DownloadItem from '../../components/DownloadItem/DownloadItem';
import styles from './Downloads.module.css';

export default function Downloads() {
  const [downloadsData, setDownloadsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDownloads() {
      try {
        setLoading(true);
        setError(null);
        const { data, error: fetchError } = await supabase
          .from('downloads')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setDownloadsData(data || []);
      } catch (err) {
        console.error('Error fetching Downloads:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDownloads();
  }, []);

  return (
    <div className={styles.page}>
      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</p>
      ) : error ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Erro ao carregar downloads.</p>
      ) : (
        <div className={styles.list}>
          {downloadsData.map((item, index) => (
            <div
              key={item.id}
              className={styles.itemWrap}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <DownloadItem titulo={item.titulo} tipo={item.tipo} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
