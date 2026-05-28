import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdSave, MdPrint, MdRefresh } from 'react-icons/md';
import styles from './RelatorioEstatistica.module.css';
import { supabase } from '../../lib/supabaseClient';

const itemDescriptions = [
  '1. Quantidade de Homens na igreja',
  '2. Quantidade de Homens na UPH',
  '3. Quantidade de Oficiais na igreja',
  '4. Quantidade de Oficiais sócios da UPH',
  '5. Quantidade de Congregações',
  '6. Quantidade de Igrejas',
  '7. Quantidade de UPHs',
  '8. Quantidade de Presbitérios',
  '9. Quantidade de Federações',
  '10. Quantidade de Sínodos',
  '11. Quantidade de Confederações Sinodais'
];

export default function RelatorioEstatistica() {
  const navigate = useNavigate();
  
  // Header identification
  const [level, setLevel] = useState('uph'); // uph, federacao, sinodal, nacional
  const [uphName, setUphName] = useState('');
  const [federacaoName, setFederacaoName] = useState('');
  const [sinodalName, setSinodalName] = useState('');
  const [anoReferencia, setAnoReferencia] = useState(new Date().getFullYear().toString());

  // Database entities states
  const [dbSinodais, setDbSinodais] = useState([]);
  const [dbFederacoes, setDbFederacoes] = useState([]);
  const [selectedSinodalId, setSelectedSinodalId] = useState('');

  // Statistical data state: array of 11 items
  const [dataItems, setDataItems] = useState(
    Array.from({ length: 11 }, () => ({ anoAtual: '', anoAnterior: '' }))
  );

  // Load saved data from localStorage if exists
  useEffect(() => {
    const saved = localStorage.getItem('secnhp_relatorio_estatistica');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLevel(parsed.level || 'uph');
        setUphName(parsed.uphName || '');
        setFederacaoName(parsed.federacaoName || '');
        setSinodalName(parsed.sinodalName || '');
        setAnoReferencia(parsed.anoReferencia || new Date().getFullYear().toString());
        if (parsed.dataItems && parsed.dataItems.length === 11) {
          setDataItems(parsed.dataItems);
        }
      } catch (e) {
        console.error('Erro ao ler dados salvos:', e);
      }
    }
  }, []);

  // Fetch Sinodais and Federações from database
  useEffect(() => {
    async function loadEntities() {
      try {
        const { data: sinodaisData } = await supabase
          .from('sinodais')
          .select('id, nome, sigla')
          .eq('situacao', 'ativa')
          .order('sigla');
        
        if (sinodaisData) {
          setDbSinodais(sinodaisData);
        }

        const { data: federacoesData } = await supabase
          .from('federacoes')
          .select('id, nome, sigla, sinodal_id')
          .eq('situacao', 'ativa')
          .order('sigla');

        if (federacoesData) {
          setDbFederacoes(federacoesData);
        }
      } catch (err) {
        console.error('Erro ao buscar entidades:', err);
      }
    }
    loadEntities();
  }, []);

  // Sync selectedSinodalId when dbSinodais and sinodalName are loaded
  useEffect(() => {
    if (dbSinodais.length > 0 && sinodalName) {
      const found = dbSinodais.find(s => s.sigla === sinodalName || s.nome === sinodalName);
      if (found) {
        setSelectedSinodalId(found.id);
      }
    }
  }, [dbSinodais, sinodalName]);

  const filteredFederacoes = selectedSinodalId
    ? dbFederacoes.filter(f => f.sinodal_id === selectedSinodalId)
    : dbFederacoes;

  // Check if an item should be enabled based on the selected level
  const isItemEnabled = (index) => {
    if (level === 'nacional') return true;
    if (level === 'sinodal') return index < 9;
    if (level === 'federacao') return index < 7;
    return index < 5; // uph
  };

  // Calculate variation percentage
  const calculateVariation = (atual, anterior) => {
    const valAtual = parseFloat(atual);
    const valAnterior = parseFloat(anterior);
    
    if (isNaN(valAtual) || isNaN(valAnterior)) return '-';
    if (valAnterior === 0) {
      return valAtual > 0 ? '+100%' : '0%';
    }
    
    const diff = ((valAtual - valAnterior) / valAnterior) * 100;
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff.toFixed(1)}%`;
  };

  const handleInputChange = (index, field, value) => {
    // Only allow numbers
    if (value !== '' && !/^\d+$/.test(value)) return;
    
    const updated = [...dataItems];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setDataItems(updated);
  };

  const handleSave = () => {
    const payload = {
      level,
      uphName,
      federacaoName,
      sinodalName,
      anoReferencia,
      dataItems
    };
    localStorage.setItem('secnhp_relatorio_estatistica', JSON.stringify(payload));
    alert('Relatório estatístico salvo localmente com sucesso!');
  };

  const handleClear = () => {
    if (window.confirm('Deseja realmente limpar todos os campos do formulário?')) {
      setUphName('');
      setFederacaoName('');
      setSinodalName('');
      setSelectedSinodalId('');
      setAnoReferencia(new Date().getFullYear().toString());
      setDataItems(Array.from({ length: 11 }, () => ({ anoAtual: '', anoAnterior: '' })));
      localStorage.removeItem('secnhp_relatorio_estatistica');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.page}>
      {/* Page Header (Hidden on print) */}
      <div className={`${styles.customHeader} no-print`}>
        <button className={styles.backIconButton} onClick={() => navigate('/menu')}>
          <MdArrowBack size={24} />
        </button>
        <span className={styles.headerTitle}>Formulário de Estatística CNHP</span>
      </div>

      <div className={styles.container}>
        {/* Official Header layout (Styled for screen and printing) */}
        <div className={styles.officialHeader}>
          <div className={styles.cnhpBrand}>
            <h2>CONFEDERAÇÃO NACIONAL DE HOMENS PRESBITERIANOS - CNHP</h2>
            <h3>FORMULÁRIO PADRÃO DE ESTATÍSTICA</h3>
          </div>
          
          {/* Level Selector - Hidden on print */}
          <div className={`${styles.levelSelectorContainer} no-print`}>
            <label className={styles.selectorLabel}>Selecione o Nível do Relatório:</label>
            <div className={styles.levelButtons}>
              {['uph', 'federacao', 'sinodal', 'nacional'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  className={`${styles.levelBtn} ${level === lvl ? styles.levelActive : ''}`}
                  onClick={() => setLevel(lvl)}
                >
                  {lvl.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Fields identification */}
          <div className={styles.identificationGrid}>
            <div className={styles.idField}>
              <span className={styles.fieldLabel}>ANO DE REFERÊNCIA:</span>
              <input 
                type="text" 
                maxLength="4"
                className={styles.idInput}
                placeholder="Ex: 2026"
                value={anoReferencia}
                onChange={(e) => setAnoReferencia(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            
            {level === 'uph' && (
              <div className={styles.idField}>
                <span className={styles.fieldLabel}>NOME DA UPH:</span>
                <input 
                  type="text" 
                  className={styles.idInput}
                  placeholder="Nome da sua UPH"
                  value={uphName}
                  onChange={(e) => setUphName(e.target.value)}
                />
              </div>
            )}

            {(level === 'uph' || level === 'federacao') && (
              <div className={styles.idField}>
                <span className={styles.fieldLabel}>FEDERAÇÃO (NOME/SIGLA):</span>
                <select 
                  className={styles.idInput}
                  value={federacaoName}
                  onChange={(e) => setFederacaoName(e.target.value)}
                  disabled={!selectedSinodalId && dbFederacoes.length > 0}
                >
                  <option value="">
                    {!selectedSinodalId && dbFederacoes.length > 0
                      ? 'Selecione primeiro uma Sinodal'
                      : 'Selecione uma Federação'}
                  </option>
                  {filteredFederacoes.map(f => (
                    <option key={f.id} value={f.sigla || f.nome}>
                      {f.sigla ? `${f.sigla} - ${f.nome}` : f.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(level === 'uph' || level === 'federacao' || level === 'sinodal') && (
              <div className={styles.idField}>
                <span className={styles.fieldLabel}>CONFEDERAÇÃO SINODAL (NOME/SIGLA):</span>
                <select 
                  className={styles.idInput}
                  value={sinodalName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSinodalName(value);
                    const found = dbSinodais.find(s => s.sigla === value || s.nome === value);
                    setSelectedSinodalId(found ? found.id : '');
                    setFederacaoName(''); // Limpar a federação ao trocar de sinodal
                  }}
                >
                  <option value="">Selecione uma Sinodal</option>
                  {dbSinodais.map(s => (
                    <option key={s.id} value={s.sigla || s.nome}>
                      {s.sigla ? `${s.sigla} - ${s.nome}` : s.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Statistical Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.statTable}>
            <thead>
              <tr>
                <th className={styles.colDesc}>ITEM / DESCRIÇÃO DO TRABALHO</th>
                <th className={styles.colVal}>QUANT. ANO ANTERIOR</th>
                <th className={styles.colVal}>QUANT. ANO ATUAL</th>
                <th className={styles.colVar}>Δ% VARIAÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {itemDescriptions.map((description, index) => {
                const enabled = isItemEnabled(index);
                const variation = calculateVariation(dataItems[index].anoAtual, dataItems[index].anoAnterior);
                const isPositive = variation.startsWith('+');
                const isNegative = variation.startsWith('-');
                
                return (
                  <tr key={index} className={!enabled ? styles.rowDisabled : ''}>
                    <td className={styles.cellDesc}>
                      <span className={styles.descText}>{description}</span>
                      {!enabled && <span className={`${styles.disabledNotice} no-print`}> (Bloqueado para nível {level.toUpperCase()})</span>}
                    </td>
                    <td className={styles.cellVal}>
                      <input
                        type="text"
                        className={styles.cellInput}
                        value={dataItems[index].anoAnterior}
                        onChange={(e) => handleInputChange(index, 'anoAnterior', e.target.value)}
                        disabled={!enabled}
                        placeholder={enabled ? "0" : "-"}
                      />
                    </td>
                    <td className={styles.cellVal}>
                      <input
                        type="text"
                        className={styles.cellInput}
                        value={dataItems[index].anoAtual}
                        onChange={(e) => handleInputChange(index, 'anoAtual', e.target.value)}
                        disabled={!enabled}
                        placeholder={enabled ? "0" : "-"}
                      />
                    </td>
                    <td className={`${styles.cellVar} ${isPositive ? styles.varPositive : ''} ${isNegative ? styles.varNegative : ''}`}>
                      {variation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Instructions block */}
        <div className={styles.instructionsBlock}>
          <h4>PREENCHIMENTO, ENCAMINHAMENTO E ORIENTAÇÕES:</h4>
          <ul>
            <li><strong>Nível UPH:</strong> Preenche os itens de 1 a 5 e envia à respectiva Federação.</li>
            <li><strong>Nível Federação:</strong> Soma os itens de 1 a 5 das UPHs, transcreve e preenche os itens 6 e 7, enviando à Confederação Sinodal.</li>
            <li><strong>Nível Sinodal:</strong> Soma os itens de 1 a 7 das Federações, transcreve e preenche os itens 8 e 9, enviando à Confederação Nacional (CNHP).</li>
            <li><strong>Nível Nacional:</strong> A CNHP, através da Secretaria de Estatística, soma os itens de 1 a 9, preenche os itens 10 e 11, e repassa o resultado consolidado.</li>
          </ul>
        </div>

        {/* Actions Row (Hidden on print) */}
        <div className={`${styles.actionsRow} no-print`}>
          <button type="button" className={styles.saveBtn} onClick={handleSave}>
            <MdSave size={20} />
            <span>Salvar Estatística</span>
          </button>
          
          <button type="button" className={styles.printBtn} onClick={handlePrint}>
            <MdPrint size={20} />
            <span>Gerar PDF / Imprimir</span>
          </button>

          <button type="button" className={styles.clearBtn} onClick={handleClear}>
            <MdRefresh size={20} />
            <span>Limpar Tudo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
