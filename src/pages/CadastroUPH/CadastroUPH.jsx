import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CadastroUPH.module.css';
import { supabase } from '../../lib/supabaseClient';

export default function CadastroUPH() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    federacao_id: '',
    nomeIgreja: '',
    numeroSocios: ''
  });
  const [federacoes, setFederacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFederacoes() {
      const { data } = await supabase.from('federacoes').select('id, nome');
      if (data) setFederacoes(data);
    }
    fetchFederacoes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from('uphs').insert({
      federacao_id: formData.federacao_id,
      nome_igreja: formData.nomeIgreja,
      numero_socios: parseInt(formData.numeroSocios, 10)
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    alert('Cadastrado com sucesso');
    setFormData({ federacao_id: '', nomeIgreja: '', numeroSocios: '' });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cadastro de UPHs</h1>
      <form className={styles.formCard} onSubmit={handleSubmit}>
        
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="federacao_id">Federação</label>
          <select 
            id="federacao_id" 
            name="federacao_id" 
            className={styles.select} 
            value={formData.federacao_id} 
            onChange={handleChange} 
            required
          >
            <option value="">Selecione uma federação</option>
            {federacoes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="nomeIgreja">Nome da igreja</label>
          <input 
            type="text" 
            id="nomeIgreja" 
            name="nomeIgreja" 
            className={styles.input} 
            value={formData.nomeIgreja} 
            onChange={handleChange} 
            placeholder="Ex: Primeira Igreja"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="numeroSocios">Número de sócios</label>
          <input 
            type="number" 
            id="numeroSocios" 
            name="numeroSocios" 
            className={styles.input} 
            value={formData.numeroSocios} 
            onChange={handleChange} 
            placeholder="Ex: 25"
            min="0"
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
