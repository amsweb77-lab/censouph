import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import styles from './Consultar.module.css';

export default function ConsultarFederacoes() {
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
          .from('federacoes')
          .select('*, sinodais(nome)');
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
    item.nome.toLowerCase().includes(search.toLowerCase()) || 
    item.sigla.toLowerCase().includes(search.toLowerCase()) ||
    item.estado.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Consulta de Federações</h1>
      
      <div className={styles.card}>
        <input 
          type="text" 
          placeholder="Buscar por nome, sigla ou estado..." 
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <p className={styles.loading}>Carregando...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : filteredData.length === 0 ? (
          <p className={styles.empty}>Nenhuma Federação encontrada.</p>
        ) : (
          <div className={styles.list}>
            {filteredData.map(item => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemName}>{item.nome}</span>
                  <span className={styles.itemBadge}>{item.sigla}</span>
                </div>
                <div className={styles.itemDetail}>
                  <strong>Sinodal:</strong> {item.sinodais?.nome || 'Não informada'}
                </div>
                <div className={styles.itemDetail}>
                  <strong>Estado:</strong> {item.estado}
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
