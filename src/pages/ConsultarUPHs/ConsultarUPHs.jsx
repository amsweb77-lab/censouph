import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import styles from './Consultar.module.css';

export default function ConsultarUPHs() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: fetchedData, error: fetchError } = await supabase
          .from('uphs')
          .select('*, federacoes(nome)');
        if (fetchError) throw fetchError;
        setData(fetchedData || []);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredData = data.filter(item => 
    item.nome_igreja.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Consulta de UPHs</h1>
      
      <div className={styles.card}>
        <input 
          type="text" 
          placeholder="Buscar por nome da igreja..." 
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p className={styles.loading}>Carregando...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : filteredData.length === 0 ? (
          <p className={styles.empty}>Nenhuma UPH encontrada.</p>
        ) : (
          <div className={styles.list}>
            {filteredData.map(item => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemName}>{item.nome_igreja}</span>
                  <span className={styles.itemBadge} style={{ backgroundColor: '#2E7D32' }}>
                    {item.numero_socios} Sócios
                  </span>
                </div>
                <div className={styles.itemDetail}>
                  <strong>Federação:</strong> {item.federacoes?.nome || 'Não informada'}
                </div>
              </div>
            ))}
          </div>
        )}

        <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
          Voltar
        </button>
      </div>
    </div>
  );
}
