import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { MdArrowBack, MdChevronRight } from 'react-icons/md';
import styles from './ConsultarSinodais.module.css';

export default function ConsultarSinodais() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Navigation steps: 'regions' | 'sinodais_list' | 'sinodal_details'
  const [step, setStep] = useState('regions');
  
  const [regioes, setRegioes] = useState([]);
  const [selectedRegiao, setSelectedRegiao] = useState(null);
  const [selectedSinodal, setSelectedSinodal] = useState(null);
  
  const [sinodais, setSinodais] = useState([]);
  const [regionStats, setRegionStats] = useState({ sinodais: 0, federacoes: 0, uphs: 0, socios: 0 });
  const [sinodalStats, setSinodalStats] = useState({ federacoes: 0, uphs: 0, socios: 0 });
  
  const [sinodalFederacoes, setSinodalFederacoes] = useState([]);
  const [sinodalDiretoria, setSinodalDiretoria] = useState([]);
  const [activeTab, setActiveTab] = useState('diretoria'); // 'diretoria' | 'federacoes'
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Drill down states inside Sinodal
  const [selectedFederacao, setSelectedFederacao] = useState(null);
  const [federacaoStats, setRegionStatsFederacao] = useState({ uphs: 0, socios: 0 });
  const [federacaoUphs, setFederacaoUphs] = useState([]);
  const [federacaoDiretoria, setFederacaoDiretoria] = useState([]);
  const [fedActiveTab, setFedActiveTab] = useState('diretoria');

  const [selectedUph, setSelectedUph] = useState(null);
  const [uphDiretoria, setUphDiretoria] = useState([]);
  const [uphStats, setUphStats] = useState({ socios: 0 });
  const [uphActiveTab, setUphActiveTab] = useState('diretoria');

  // Load regions on mount
  useEffect(() => {
    async function loadRegioes() {
      try {
        const { data, error } = await supabase.from('regioes').select('*');
        if (error) throw error;
        if (data) {
          const customOrder = ['Centro-Oeste', 'Nordeste', 'Norte I', 'Norte II', 'Sudeste I', 'Sudeste II', 'Sul'];
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
    setStep('sinodais_list');
    setLoading(true);
    setError(null);
    
    try {
      // 1. Fetch Sinodais for region
      const { data: sinodaisData, error: sErr } = await supabase
        .from('sinodais')
        .select('*')
        .eq('regiao_id', regiao.id)
        .order('nome');
      if (sErr) throw sErr;
      setSinodais(sinodaisData || []);

      // 2. Fetch region statistics
      // Get all Sinodais IDs
      const sIds = (sinodaisData || []).map(s => s.id);
      
      let fCount = 0;
      let uCount = 0;
      let sSum = 0;
      
      if (sIds.length > 0) {
        // Federações count
        const { count: fedCount, error: fErr } = await supabase
          .from('federacoes')
          .select('id', { count: 'exact', head: true })
          .in('sinodal_id', sIds);
        if (!fErr) fCount = fedCount || 0;

        // UPHs and Sócios stats
        // We first need the Federações IDs
        const { data: fData } = await supabase
          .from('federacoes')
          .select('id')
          .in('sinodal_id', sIds);
        const fIds = (fData || []).map(f => f.id);

        if (fIds.length > 0) {
          const { data: uphsData, error: uErr } = await supabase
            .from('uphs')
            .select('numero_socios');
          if (!uErr && uphsData) {
            uCount = uphsData.length;
            sSum = uphsData.reduce((acc, curr) => acc + (curr.numero_socios || 0), 0);
          }
        }
      }

      setRegionStats({
        sinodais: sinodaisData?.length || 0,
        federacoes: fCount,
        uphs: uCount,
        socios: sSum
      });

    } catch (err) {
      console.error(err);
      setError('Erro ao carregar dados da região.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.initialRegion && regioes.length > 0) {
      const found = regioes.find(r => r.id === location.state.initialRegion.id || r.nome === location.state.initialRegion.nome);
      if (found) {
        handleSelectRegion(found);
      }
    }
  }, [location.state, regioes]);

  // Handle Sinodal select
  const handleSelectSinodal = async (sinodal) => {
    setSelectedSinodal(sinodal);
    setStep('sinodal_details');
    setActiveTab('diretoria');
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Federações under this Sinodal
      const { data: fedData, error: fedErr } = await supabase
        .from('federacoes')
        .select('*')
        .eq('sinodal_id', sinodal.id)
        .order('nome');
      if (fedErr) throw fedErr;
      setSinodalFederacoes(fedData || []);

      // 2. Fetch Board of Directors (membros_diretoria) for this Sinodal
      const { data: dirData, error: dirErr } = await supabase
        .from('membros_diretoria')
        .select('*')
        .eq('tipo_entidade', 'sinodal')
        .eq('entidade_id', sinodal.id);
      if (dirErr) throw dirErr;
      
      // Sort board by custom order (Presidente, Vice-Presidente, etc.)
      const order = ['Presidente', 'Vice-Presidente', 'Secretário Executivo', 'Tesoureiro'];
      const sortedDir = (dirData || []).sort((a, b) => {
        const indexA = order.indexOf(a.cargo);
        const indexB = order.indexOf(b.cargo);
        return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
      });
      setSinodalDiretoria(sortedDir);

      // 3. Calculate Sinodal Stats
      const fIds = (fedData || []).map(f => f.id);
      let uCount = 0;
      let sSum = 0;

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

      setSinodalStats({
        federacoes: fedData?.length || 0,
        uphs: uCount,
        socios: sSum
      });

    } catch (err) {
      console.error(err);
      setError('Erro ao carregar detalhes da Sinodal.');
    } finally {
      setLoading(false);
    }
  };

  // Handle select Federação inside Sinodal drill-down
  const handleSelectFederacao = async (fed) => {
    setSelectedFederacao(fed);
    setStep('federacao_details');
    setFedActiveTab('diretoria');
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

      setRegionStatsFederacao({
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

  // Handle select UPH inside Sinodal drill-down
  const handleSelectUph = async (uph) => {
    setSelectedUph(uph);
    setStep('uph_details');
    setUphActiveTab('diretoria');
    setLoading(true);
    setError(null);

    try {
      // Fetch Board of Directors for UPH
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

  // Back navigation handler
  const handleBack = () => {
    if (step === 'uph_details') {
      setStep('federacao_details');
    } else if (step === 'federacao_details') {
      setStep('sinodal_details');
    } else if (step === 'sinodal_details') {
      setStep('sinodais_list');
    } else if (step === 'sinodais_list') {
      setStep('regions');
      setSearchTerm('');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={styles.page}>
      {/* Dynamic Header */}
      <div className={styles.customHeader}>
        <button className={styles.backIconButton} onClick={handleBack}>
          <MdArrowBack size={24} />
        </button>
        <span className={styles.headerTitle}>
          {step === 'uph_details' ? 'Informações' : step === 'federacao_details' ? 'Informações' : 'Consultar Sinodais'}
        </span>
      </div>

      <div className={styles.container}>
        {/* ================= STEP 1: REGIONS ================= */}
        {step === 'regions' && (
          <>
            <h1 className={styles.mainTitle}>CONFEDERAÇÕES SINODAIS</h1>
            <h2 className={styles.subTitle}>Escolha uma região</h2>
            <div className={styles.regionsGrid}>
              {regioes.map((reg) => (
                <button
                  key={reg.id}
                  className={styles.regionBtn}
                  onClick={() => handleSelectRegion(reg)}
                >
                  {reg.nome === 'Norte I' ? 'Norte 1' : reg.nome === 'Norte II' ? 'Norte 2' : reg.nome === 'Sudeste I' ? 'Sudeste 1' : reg.nome === 'Sudeste II' ? 'Sudeste 2' : reg.nome}
                </button>
              ))}
            </div>
          </>
        )}

        {/* ================= STEP 2: SINODAIS LIST ================= */}
        {step === 'sinodais_list' && selectedRegiao && (
          <>
            <h1 className={styles.mainTitle}>CONFEDERAÇÕES SINODAIS</h1>
            <h2 className={styles.subTitle}>Região {selectedRegiao.nome}</h2>

            {/* Statistics Card */}
            <div className={styles.statsCard}>
              <h3 className={styles.statsCardTitle}>Estatísticas</h3>
              <div className={styles.statsRow}>
                <div className={styles.statBox} style={{ backgroundColor: '#004D40' }}>
                  <span className={styles.statLabel}>Sinodais</span>
                  <span className={styles.statVal}>{regionStats.sinodais}</span>
                </div>
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

            <p className={styles.helperText}>* As sinodais em cinza estão inativas</p>

            {loading ? (
              <p className={styles.loading}>Carregando...</p>
            ) : error ? (
              <p className={styles.error}>{error}</p>
            ) : sinodais.length === 0 ? (
              <p className={styles.empty}>Nenhuma Sinodal cadastrada para esta região.</p>
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
                  {sinodais
                    .filter(
                      (item) =>
                        (item.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (item.sigla || '').toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((item) => (
                      <button 
                        key={item.id} 
                        className={`${styles.listItem} ${item.situacao === 'inativa' ? styles.listItemInactive : ''}`}
                        onClick={() => handleSelectSinodal(item)}
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

        {/* ================= STEP 3: SINODAL DETAILS ================= */}
        {step === 'sinodal_details' && selectedSinodal && (
          <>
            <h1 className={styles.mainTitle}>CONFEDERAÇÃO SINODAL</h1>
            <h2 className={styles.subTitle}>{selectedSinodal.nome} - {selectedSinodal.sigla}</h2>

            {/* Statistics Card */}
            <div className={styles.statsCard}>
              <h3 className={styles.statsCardTitle}>Estatísticas</h3>
              <div className={styles.statsRowThree}>
                <div className={styles.statBox} style={{ backgroundColor: '#00796B' }}>
                  <span className={styles.statLabel}>Feds.</span>
                  <span className={styles.statVal}>{sinodalStats.federacoes}</span>
                </div>
                <div className={styles.statBox} style={{ backgroundColor: '#388E3C' }}>
                  <span className={styles.statLabel}>UPHs</span>
                  <span className={styles.statVal}>{sinodalStats.uphs}</span>
                </div>
                <div className={styles.statBox} style={{ backgroundColor: '#4CAF50' }}>
                  <span className={styles.statLabel}>Sócios</span>
                  <span className={styles.statVal}>{sinodalStats.socios}</span>
                </div>
              </div>
            </div>

            {/* Segmented Control / Tabs */}
            <div className={styles.tabContainer}>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'diretoria' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('diretoria')}
              >
                Diretoria
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'federacoes' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('federacoes')}
              >
                Federações
              </button>
            </div>

            {/* Tab Contents */}
            {loading ? (
              <p className={styles.loading}>Carregando...</p>
            ) : activeTab === 'diretoria' ? (
              <div className={styles.tabContent}>
                <h3 className={styles.tabSectionTitle}>Diretoria 2026 - 2027</h3>
                {sinodalDiretoria.length === 0 ? (
                  <p className={styles.empty}>Nenhum membro da diretoria cadastrado.</p>
                ) : (
                  <div className={styles.diretoriaList}>
                    {sinodalDiretoria.map((membro) => (
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
                <h3 className={styles.tabSectionTitle}>Federações</h3>
                {sinodalFederacoes.length === 0 ? (
                  <p className={styles.empty}>Nenhuma Federação cadastrada.</p>
                ) : (
                  <div className={styles.itemsList}>
                    {sinodalFederacoes.map((fed) => (
                      <button 
                        key={fed.id} 
                        className={`${styles.listItem} ${fed.situacao === 'inativa' ? styles.listItemInactive : ''}`}
                        onClick={() => handleSelectFederacao(fed)}
                      >
                        <span className={styles.listItemName}>
                          <strong>{fed.sigla}</strong> - {fed.nome}
                        </span>
                        <MdChevronRight size={24} className={styles.chevron} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ================= STEP 4: FEDERACAO DETAILS ================= */}
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
                className={`${styles.tabBtn} ${fedActiveTab === 'diretoria' ? styles.tabBtnActive : ''}`}
                onClick={() => setFedActiveTab('diretoria')}
              >
                Diretoria
              </button>
              <button 
                className={`${styles.tabBtn} ${fedActiveTab === 'uphs' ? styles.tabBtnActive : ''}`}
                onClick={() => setFedActiveTab('uphs')}
              >
                UPHs
              </button>
            </div>

            {loading ? (
              <p className={styles.loading}>Carregando...</p>
            ) : fedActiveTab === 'diretoria' ? (
              <div className={styles.tabContent}>
                <h3 className={styles.tabSectionTitle}>Diretoria 2026 - 2027</h3>
                {federacaoDiretoria.length === 0 ? (
                  <p className={styles.empty}>Nenhum membro da diretoria cadastrado para esta Federação.</p>
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
                      <button 
                        key={uph.id} 
                        className={`${styles.listItem} ${uph.situacao === 'inativa' ? styles.listItemInactive : ''}`}
                        onClick={() => handleSelectUph(uph)}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className={styles.listItemName} style={{ fontWeight: '700' }}>
                            {uph.nome_igreja}
                          </span>
                          <span style={{ fontSize: '12px', opacity: 0.8, fontWeight: '500' }}>
                            {selectedFederacao.sigla} - {selectedFederacao.nome} | {selectedSinodal.sigla}
                          </span>
                        </div>
                        <MdChevronRight size={24} className={styles.chevron} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ================= STEP 5: UPH DETAILS ================= */}
        {step === 'uph_details' && selectedUph && (
          <>
            <h1 className={styles.mainTitle}>DETALHES DA UPH</h1>
            <h2 className={styles.subTitle}>{selectedUph.nome_igreja}</h2>

            <div className={styles.statsCard}>
              <h3 className={styles.statsCardTitle}>Sócios Ativos</h3>
              <div className={styles.statBoxSingle} style={{ backgroundColor: '#1B5E20', borderRadius: '10px', padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#FFFFFF', width: '100%', boxSizing: 'border-box' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', opacity: '0.95', marginBottom: '4px', textTransform: 'uppercase' }}>Número de Sócios</span>
                <span style={{ fontSize: '24px', fontWeight: '900' }}>{uphStats.socios}</span>
              </div>
            </div>

            <div className={styles.tabContainer}>
              <button 
                className={`${styles.tabBtn} ${uphActiveTab === 'diretoria' ? styles.tabBtnActive : ''}`}
                onClick={() => setUphActiveTab('diretoria')}
              >
                Diretoria
              </button>
              <button 
                className={`${styles.tabBtn} ${uphActiveTab === 'info' ? styles.tabBtnActive : ''}`}
                onClick={() => setUphActiveTab('info')}
              >
                Informações
              </button>
            </div>

            {loading ? (
              <p className={styles.loading}>Carregando...</p>
            ) : uphActiveTab === 'diretoria' ? (
              <div className={styles.tabContent}>
                <h3 className={styles.tabSectionTitle}>Diretoria 2026 - 2027</h3>
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
                  <span className={styles.membroNome}>{selectedFederacao.nome}</span>
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
