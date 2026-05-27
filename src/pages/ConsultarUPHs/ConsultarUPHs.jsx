import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { MdArrowBack, MdChevronRight } from 'react-icons/md';
import styles from './ConsultarUPHs.module.css';

export default function ConsultarUPHs() {
  const navigate = useNavigate();
  
  // Navigation steps: 'regions' | 'uphs_list' | 'uph_details'
  const [step, setStep] = useState('regions');
  
  const [regioes, setRegioes] = useState([]);
  const [selectedRegiao, setSelectedRegiao] = useState(null);
  const [selectedUph, setSelectedUph] = useState(null);
  
  const [uphs, setUphs] = useState([]);
  const [regionStats, setRegionStats] = useState({ uphs: 0, socios: 0 });
  const [uphStats, setUphStats] = useState({ socios: 0 });
  
  const [uphDiretoria, setUphDiretoria] = useState([]);
  const [activeTab, setActiveTab] = useState('diretoria'); // 'diretoria' | 'info'
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load regions on mount
  useEffect(() => {
    async function loadRegioes() {
      try {
        const { data, error } = await supabase.from('regioes').select('*').order('nome');
        if (error) throw error;
        setRegioes(data || []);
      } catch (err) {
        console.error('Erro ao carregar regiões:', err);
      }
    }
    loadRegioes();
  }, []);

  // Handle region select
  const handleSelectRegion = async (regiao) => {
    setSelectedRegiao(regiao);
    setStep('uphs_list');
    setLoading(true);
    setError(null);
    
    try {
      // 1. Fetch UPHs inside this region
      // We first need the Sinodais and Federações in this region
      const { data: sinodaisData } = await supabase
        .from('sinodais')
        .select('id')
        .eq('regiao_id', regiao.id);
      
      const sIds = (sinodaisData || []).map(s => s.id);
      
      let uData = [];
      let sSum = 0;

      if (sIds.length > 0) {
        const { data: fedData } = await supabase
          .from('federacoes')
          .select('id')
          .in('sinodal_id', sIds);
        
        const fIds = (fedData || []).map(f => f.id);
        
        if (fIds.length > 0) {
          const { data, error: uErr } = await supabase
            .from('uphs')
            .select('*, federacoes(nome)')
            .in('federacao_id', fIds)
            .order('nome_igreja');
          if (uErr) throw uErr;
          uData = data || [];
          sSum = uData.reduce((acc, curr) => acc + (curr.numero_socios || 0), 0);
        }
      }

      setUphs(uData);
      setRegionStats({
        uphs: uData.length,
        socios: sSum
      });

    } catch (err) {
      console.error(err);
      setError('Erro ao carregar UPHs da região.');
    } finally {
      setLoading(false);
    }
  };

  // Handle UPH select
  const handleSelectUph = async (uph) => {
    setSelectedUph(uph);
    setStep('uph_details');
    setActiveTab('diretoria');
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Board of Directors for this UPH
      const { data: dirData, error: dirErr } = await supabase
        .from('membros_diretoria')
        .select('*')
        .eq('tipo_entidade', 'uph')
        .eq('entidade_id', uph.id);
      if (dirErr) throw dirErr;
      
      const order = ['Presidente', 'Vice-Presidente', 'Secretário Executivo', 'Tesoureiro'];
      const sortedDir = (dirData || []).sort((a, b) => {
        const indexA = order.indexOf(a.cargo);
        const indexB = order.indexOf(b.cargo);
        return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
      });
      setUphDiretoria(sortedDir);

      setUphStats({
        socios: uph.numero_socios || 0
      });

    } catch (err) {
      console.error(err);
      setError('Erro ao carregar detalhes da UPH.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'uph_details') {
      setStep('uphs_list');
    } else if (step === 'uphs_list') {
      setStep('regions');
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
          {step === 'uph_details' ? 'Informações' : 'Consultar UPHs'}
        </span>
      </div>

      <div className={styles.container}>
        {/* Step 1: Regions */}
        {step === 'regions' && (
          <>
            <h1 className={styles.mainTitle}>UNIÃO PRESBITERIANA DE HOMENS</h1>
            <h2 className={styles.subTitle}>Escolha uma região</h2>
            <div className={styles.regionsGrid}>
              {regioes.map((reg) => (
                <button
                  key={reg.id}
                  className={styles.regionBtn}
                  onClick={() => handleSelectRegion(reg)}
                >
                  {reg.nome}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2: UPHs List */}
        {step === 'uphs_list' && selectedRegiao && (
          <>
            <h1 className={styles.mainTitle}>UNIÕES LOCAIS (UPHs)</h1>
            <h2 className={styles.subTitle}>Região {selectedRegiao.nome}</h2>

            <div className={styles.statsCard}>
              <h3 className={styles.statsCardTitle}>Estatísticas</h3>
              <div className={styles.statsRowTwo}>
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
            ) : uphs.length === 0 ? (
              <p className={styles.empty}>Nenhuma UPH cadastrada para esta região.</p>
            ) : (
              <div className={styles.itemsList}>
                {uphs.map((item) => (
                  <button 
                    key={item.id} 
                    className={styles.listItem}
                    onClick={() => handleSelectUph(item)}
                  >
                    <span className={styles.listItemName}>
                      {item.nome_igreja}
                    </span>
                    <MdChevronRight size={24} className={styles.chevron} />
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Step 3: UPH Details */}
        {step === 'uph_details' && selectedUph && (
          <>
            <h1 className={styles.mainTitle}>DETALHES DA UPH</h1>
            <h2 className={styles.subTitle}>{selectedUph.nome_igreja}</h2>

            <div className={styles.statsCard}>
              <h3 className={styles.statsCardTitle}>Sócios Ativos</h3>
              <div className={styles.statBoxSingle} style={{ backgroundColor: '#1B5E20' }}>
                <span className={styles.statLabelSingle}>Número de Sócios</span>
                <span className={styles.statValSingle}>{uphStats.socios}</span>
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
                className={`${styles.tabBtn} ${activeTab === 'info' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('info')}
              >
                Informações
              </button>
            </div>

            {loading ? (
              <p className={styles.loading}>Carregando...</p>
            ) : activeTab === 'diretoria' ? (
              <div className={styles.tabContent}>
                <h3 className={styles.tabSectionTitle}>Diretoria 2025 - 2027</h3>
                {uphDiretoria.length === 0 ? (
                  <p className={styles.empty}>Nenhum membro da diretoria cadastrado para esta UPH.</p>
                ) : (
                  <div className={styles.diretoriaList}>
                    {uphDiretoria.map((membro) => (
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
                <h3 className={styles.tabSectionTitle}>Informações Gerais</h3>
                <div className={styles.membroCard}>
                  <span className={styles.membroCargo}>Federação</span>
                  <span className={styles.membroNome}>{selectedUph.federacoes?.nome || 'Não informada'}</span>
                </div>
                <div className={styles.membroCard} style={{ marginTop: '8px' }}>
                  <span className={styles.membroCargo}>Data de Cadastro</span>
                  <span className={styles.membroNome}>
                    {new Date(selectedUph.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
