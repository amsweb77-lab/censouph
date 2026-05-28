import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { MdArrowBack, MdChevronRight } from 'react-icons/md';
import styles from './ConsultarFederacoes.module.css';
import InteractiveMap from '../../components/InteractiveMap/InteractiveMap';

export default function ConsultarFederacoes() {
  const navigate = useNavigate();
  
  // Navigation steps: 'regions' | 'federacoes_list' | 'federacao_details'
  const [step, setStep] = useState('regions');
  
  const [regioes, setRegioes] = useState([]);
  const [selectedRegiao, setSelectedRegiao] = useState(null);
  const [selectedFederacao, setSelectedFederacao] = useState(null);
  
  const [federacoes, setFederacoes] = useState([]);
  const [regionStats, setRegionStats] = useState({ federacoes: 0, uphs: 0, socios: 0 });
  const [federacaoStats, setFederacaoStats] = useState({ uphs: 0, socios: 0 });
  
  const [federacaoUphs, setFederacaoUphs] = useState([]);
  const [federacaoDiretoria, setFederacaoDiretoria] = useState([]);
  const [activeTab, setActiveTab] = useState('diretoria'); // 'diretoria' | 'uphs'
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load regions on mount
  useEffect(() => {
    async function loadRegioes() {
      try {
        const { data, error } = await supabase.from('regioes').select('*');
        if (error) throw error;
        if (data) {
          const customOrder = ['Norte I', 'Norte II', 'Nordeste', 'Centro-Oeste', 'Sul', 'Sudeste I', 'Sudeste II'];
          const sorted = [...data].sort((a, b) => {
            const indexA = customOrder.indexOf(a.nome);
            const indexB = customOrder.indexOf(b.nome);
            return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
          });
          setRegioes(sorted);
        } else {
          setRegioes([]);
        }
      } catch (err) {
        console.error('Erro ao carregar regiões:', err);
      }
    }
    loadRegioes();
  }, []);

  // Handle region select
  const handleSelectRegion = async (regiao) => {
    setSelectedRegiao(regiao);
    setStep('federacoes_list');
    setLoading(true);
    setError(null);
    
    try {
      // 1. Fetch Federações inside this region
      // We first need the Sinodais in this region
      const { data: sinodaisData } = await supabase
        .from('sinodais')
        .select('id')
        .eq('regiao_id', regiao.id);
      
      const sIds = (sinodaisData || []).map(s => s.id);
      
      let fData = [];
      let uCount = 0;
      let sSum = 0;

      if (sIds.length > 0) {
        const { data, error: fErr } = await supabase
          .from('federacoes')
          .select('*, sinodais(nome)')
          .in('sinodal_id', sIds)
          .order('nome');
        if (fErr) throw fErr;
        fData = data || [];

        const fIds = fData.map(f => f.id);
        if (fIds.length > 0) {
          const { data: uphsData } = await supabase
            .from('uphs')
            .select('numero_socios')
            .in('federacao_id', fIds);
          if (uphsData) {
            uCount = uphsData.length;
            sSum = uphsData.reduce((acc, curr) => acc + (curr.numero_socios || 0), 0);
          }
        }
      }

      setFederacoes(fData);
      setRegionStats({
        federacoes: fData.length,
        uphs: uCount,
        socios: sSum
      });

    } catch (err) {
      console.error(err);
      setError('Erro ao carregar federações da região.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Federação select
  const handleSelectFederacao = async (fed) => {
    setSelectedFederacao(fed);
    setStep('federacao_details');
    setActiveTab('diretoria');
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch UPHs under this Federação
      const { data: uphsData, error: uErr } = await supabase
        .from('uphs')
        .select('*')
        .eq('federacao_id', fed.id)
        .order('nome_igreja');
      if (uErr) throw uErr;
      setFederacaoUphs(uphsData || []);

      // 2. Fetch Board of Directors for this Federação
      const { data: dirData, error: dirErr } = await supabase
        .from('membros_diretoria')
        .select('*')
        .eq('tipo_entidade', 'federacao')
        .eq('entidade_id', fed.id);
      if (dirErr) throw dirErr;
      
      const order = ['Presidente', 'Vice-Presidente', 'Secretário Executivo', 'Tesoureiro'];
      const sortedDir = (dirData || []).sort((a, b) => {
        const indexA = order.indexOf(a.cargo);
        const indexB = order.indexOf(b.cargo);
        return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
      });
      setFederacaoDiretoria(sortedDir);

      // 3. Calculate Stats
      const uCount = uphsData?.length || 0;
      const sSum = (uphsData || []).reduce((acc, curr) => acc + (curr.numero_socios || 0), 0);

      setFederacaoStats({
        uphs: uCount,
        socios: sSum
      });

    } catch (err) {
      console.error(err);
      setError('Erro ao carregar detalhes da Federação.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'federacao_details') {
      setStep('federacoes_list');
    } else if (step === 'federacoes_list') {
      setStep('regions');
      setSearchTerm('');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.customHeader}>
        <button className={styles.backIconButton} onClick={handleBack}>
          <MdArrowBack size={24} />
        </button>
        <span className={styles.headerTitle}>
          {step === 'federacao_details' ? 'Informações' : 'Consultar Federações'}
        </span>
      </div>

      <div className={styles.container}>
        {/* Step 1: Regions */}
        {step === 'regions' && (
          <>
            <h1 className={styles.mainTitle}>FEDERAÇÕES DE HOMENS</h1>
            <h2 className={styles.subTitle}>Escolha uma região</h2>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
              <InteractiveMap 
                regioes={regioes}
                onRegionClick={handleSelectRegion}
              />
            </div>
          </>
        )}

        {/* Step 2: Federações List */}
        {step === 'federacoes_list' && selectedRegiao && (
          <>
            <h1 className={styles.mainTitle}>FEDERAÇÕES DE HOMENS</h1>
            <h2 className={styles.subTitle}>Região {selectedRegiao.nome}</h2>

            <div className={styles.statsCard}>
              <h3 className={styles.statsCardTitle}>Estatísticas</h3>
              <div className={styles.statsRowThree}>
                <div className={styles.statBox} style={{ backgroundColor: '#00796B' }}>
                  <span className={styles.statLabel}>Feds.</span>
                  <span className={styles.statVal}>{regionStats.federacoes}</span>
                </div>
                <div className={styles.statBox} style={{ backgroundColor: '#388E3C' }}>
                  <span className={styles.statLabel}>UPHs</span>
                  <span className={styles.statVal}>{regionStats.uphs}</span>
                </div>
                <div className={styles.statBox} style={{ backgroundColor: '#4CAF50' }}>
                  <span className={styles.statLabel}>Sócios</span>
                  <span className={styles.statVal}>{regionStats.socios}</span>
                </div>
              </div>
            </div>

            {loading ? (
              <p className={styles.loading}>Carregando...</p>
            ) : error ? (
              <p className={styles.error}>{error}</p>
            ) : federacoes.length === 0 ? (
              <p className={styles.empty}>Nenhuma Federação cadastrada para esta região.</p>
            ) : (
              <>
                <div className={styles.searchBarContainer}>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Pesquisar por nome ou sigla..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className={styles.itemsList}>
                  {federacoes
                    .filter(
                      (item) =>
                        (item.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (item.sigla || '').toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((item) => (
                      <button 
                        key={item.id} 
                        className={`${styles.listItem} ${item.situacao === 'inativa' ? styles.listItemInactive : ''}`}
                        onClick={() => handleSelectFederacao(item)}
                      >
                        <span className={styles.listItemName}>
                          <strong>{item.sigla}</strong> - {item.nome}
                        </span>
                        <MdChevronRight size={24} className={styles.chevron} />
                      </button>
                    ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Step 3: Federação Details */}
        {step === 'federacao_details' && selectedFederacao && (
          <>
            <h1 className={styles.mainTitle}>FEDERAÇÃO DE HOMENS</h1>
            <h2 className={styles.subTitle}>{selectedFederacao.nome} - {selectedFederacao.sigla}</h2>

            <div className={styles.statsCard}>
              <h3 className={styles.statsCardTitle}>Estatísticas</h3>
              <div className={styles.statsRowTwo}>
                <div className={styles.statBox} style={{ backgroundColor: '#388E3C' }}>
                  <span className={styles.statLabel}>UPHs</span>
                  <span className={styles.statVal}>{federacaoStats.uphs}</span>
                </div>
                <div className={styles.statBox} style={{ backgroundColor: '#4CAF50' }}>
                  <span className={styles.statLabel}>Sócios</span>
                  <span className={styles.statVal}>{federacaoStats.socios}</span>
                </div>
              </div>
            </div>

            <div className={styles.tabContainer}>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'diretoria' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('diretoria')}
              >
                Diretoria
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'uphs' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('uphs')}
              >
                UPHs
              </button>
            </div>

            {loading ? (
              <p className={styles.loading}>Carregando...</p>
            ) : activeTab === 'diretoria' ? (
              <div className={styles.tabContent}>
                <h3 className={styles.tabSectionTitle}>Diretoria 2025 - 2027</h3>
                {federacaoDiretoria.length === 0 ? (
                  <p className={styles.empty}>Nenhum membro da diretoria cadastrado.</p>
                ) : (
                  <div className={styles.diretoriaList}>
                    {federacaoDiretoria.map((membro) => (
                      <div key={membro.id} className={styles.membroCard}>
                        <span className={styles.membroCargo}>{membro.cargo}</span>
                        <span className={styles.membroNome}>{membro.nome}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.tabContent}>
                <h3 className={styles.tabSectionTitle}>UPHs Locais</h3>
                {federacaoUphs.length === 0 ? (
                  <p className={styles.empty}>Nenhuma UPH cadastrada.</p>
                ) : (
                  <div className={styles.itemsList}>
                    {federacaoUphs.map((uph) => (
                      <div key={uph.id} className={`${styles.listItem} ${uph.situacao === 'inativa' ? styles.listItemInactive : ''}`} style={{ cursor: 'default' }}>
                        <span className={styles.listItemName}>
                          {uph.nome_igreja} ({uph.numero_socios} sócios)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
