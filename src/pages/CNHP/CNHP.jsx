import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import MemberCard from '../../components/MemberCard/MemberCard';
import styles from './CNHP.module.css';

export default function CNHP() {
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMembros() {
      try {
        setLoading(true);
        setError(null);
        const { data, error: fetchError } = await supabase
          .from('membros_diretoria')
          .select('*')
          .eq('tipo_entidade', 'nacional');

        if (fetchError) throw fetchError;
        setMembros(data || []);
      } catch (err) {
        console.error('Error fetching CNHP members:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMembros();
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Diretoria da CNHP</h1>
        <p className={styles.subtitle}>Confederação Nacional de Homens Presbiterianos</p>
        <p className={styles.mandato}>Mandato 2022 - 2026</p>
      </header>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</p>
      ) : error ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Erro ao carregar diretoria.</p>
      ) : (
        <div className={styles.list}>
          {membros.map((membro, index) => (
            <div
              key={membro.id}
              className={styles.cardWrap}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <MemberCard
                nome={membro.nome}
                cargo={membro.cargo}
                telefone={membro.telefone}
                email={membro.email}
                foto={membro.foto_url || membro.foto}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
