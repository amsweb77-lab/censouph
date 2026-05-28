import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CadastroFederacao.module.css';
import { supabase } from '../../lib/supabaseClient';

export default function CadastroFederacao() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    sinodal_id: '',
    estado: '',
    nome: '',
    sigla: '',
    situacao: 'ativa'
  });
  const [sinodais, setSinodais] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSinodais() {
      const { data } = await supabase.from('sinodais').select('id, nome, uf');
      if (data) setSinodais(data);
    }
    fetchSinodais();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'sinodal_id') {
      // Ao selecionar uma sinodal, preenche automaticamente o Estado com o UF
      const sinodal = sinodais.find(s => String(s.id) === String(value));
      setFormData(prev => ({
        ...prev,
        sinodal_id: value,
        estado: sinodal?.uf ?? ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from('federacoes').insert({
      sinodal_id: formData.sinodal_id,
      estado: formData.estado,
      nome: formData.nome,
      sigla: formData.sigla,
      situacao: formData.situacao
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    alert('Cadastrado com sucesso');
    setFormData({ sinodal_id: '', estado: '', nome: '', sigla: '', situacao: 'ativa' });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cadastro de Federações</h1>
      <form className={styles.formCard} onSubmit={handleSubmit}>
        
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="sinodal_id">Sinodal</label>
          <select 
            id="sinodal_id" 
            name="sinodal_id" 
            className={styles.select} 
            value={formData.sinodal_id} 
            onChange={handleChange} 
            required
          >
            <option value="">Selecione uma sinodal</option>
            {sinodais.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="estado">Estado</label>
          <input
            type="text"
            id="estado"
            name="estado"
            className={styles.input}
            value={formData.estado}
            readOnly
            placeholder={formData.sinodal_id ? '' : 'Preenchido automaticamente pela sinodal'}
            title="Preenchido automaticamente ao selecionar a sinodal"
            style={{
              backgroundColor: formData.estado ? '#e8f5e9' : '#f5f5f5',
              color: formData.estado ? '#2e7d32' : '#999',
              cursor: 'default',
              fontWeight: formData.estado ? '600' : '400'
            }}
            required
          />
          {formData.estado && (
            <span style={{ fontSize: '11px', color: '#2e7d32', marginTop: '4px', display: 'block' }}>
              ✓ Vinculado à sinodal selecionada
            </span>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="nome">Nome da federação</label>
          <input 
            type="text" 
            id="nome" 
            name="nome" 
            className={styles.input} 
            value={formData.nome} 
            onChange={handleChange} 
            placeholder="Ex: São Luis"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="sigla">Sigla</label>
          <input 
            type="text" 
            id="sigla" 
            name="sigla" 
            className={styles.input} 
            value={formData.sigla} 
            onChange={handleChange} 
            placeholder="Ex: FES"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="situacao">Situação</label>
          <select 
            id="situacao" 
            name="situacao" 
            className={styles.select} 
            value={formData.situacao} 
            onChange={handleChange} 
            required
          >
            <option value="ativa">Ativa</option>
            <option value="inativa">Inativa</option>
          </select>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'CADASTRANDO...' : 'CADASTRAR'}
        </button>
        <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
          VOLTAR
        </button>
      </form>
    </div>
  );
}
