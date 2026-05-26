import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CadastroSinodal.module.css';
import { supabase } from '../../lib/supabaseClient';

export default function CadastroSinodal() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    regiao_id: '',
    nome: '',
    sigla: ''
  });
  const [regioes, setRegioes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRegioes() {
      const { data } = await supabase.from('regioes').select('id, nome');
      if (data) setRegioes(data);
    }
    fetchRegioes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from('sinodais').insert({
      regiao_id: formData.regiao_id,
      nome: formData.nome,
      sigla: formData.sigla
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    alert('Cadastrado com sucesso');
    setFormData({ regiao_id: '', nome: '', sigla: '' });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cadastro de Sinodais</h1>
      <form className={styles.formCard} onSubmit={handleSubmit}>
        
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="regiao_id">Região</label>
          <select 
            id="regiao_id" 
            name="regiao_id" 
            className={styles.select} 
            value={formData.regiao_id} 
            onChange={handleChange} 
            required
          >
            <option value="">Selecione uma região</option>
            {regioes.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="nome">Nome da sinodal</label>
          <input 
            type="text" 
            id="nome" 
            name="nome" 
            className={styles.input} 
            value={formData.nome} 
            onChange={handleChange} 
            placeholder="Ex: Sinodal Central"
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
            placeholder="Ex: CSS"
            required
          />
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
