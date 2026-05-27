import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CadastroDiretoria.module.css';
import { supabase } from '../../lib/supabaseClient';

const tiposDiretoria = ['UPH', 'Federação', 'Sinodal'];
const cargos = [
  'Presidente', 
  'Vice-Presidente', 
  'Secretário Executivo', 
  '1º Secretário', 
  '2º Secretário', 
  'Tesoureiro', 
  'Conselheiro', 
  'Sec. Presbiterial', 
  'Sec. Sinodal'
];
const oficios = ['Presbítero', 'Diácono', 'Reverendo', 'Não-Oficial'];

export default function CadastroDiretoria() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tipoDiretoria: '',
    entidade_id: '',
    cargo: '',
    anoInicio: '',
    anoFim: '',
    oficio: '',
    nome: '',
    telefone: '',
    whatsapp: false,
    email: '',
    nascimento: ''
  });
  const [entidadesOptions, setEntidadesOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);

  useEffect(() => {
    async function fetchEntidades() {
      if (!formData.tipoDiretoria) {
        setEntidadesOptions([]);
        return;
      }
      
      let table = '';
      let columns = 'id, nome';
      if (formData.tipoDiretoria === 'UPH') {
        table = 'uphs';
        columns = 'id, nome_igreja';
      } else if (formData.tipoDiretoria === 'Federação') {
        table = 'federacoes';
      } else if (formData.tipoDiretoria === 'Sinodal') {
        table = 'sinodais';
      }

      const { data } = await supabase.from(table).select(columns);
      if (data) {
        setEntidadesOptions(data.map(item => ({
          id: item.id,
          nome: item.nome || item.nome_igreja
        })));
      }
    }
    fetchEntidades();
  }, [formData.tipoDiretoria]);

  // Business rule: automatically reset cargo if type changes and current cargo is not allowed in the new type
  useEffect(() => {
    if (formData.tipoDiretoria && formData.cargo) {
      const allowed = getFilteredCargos();
      if (!allowed.includes(formData.cargo)) {
        setFormData(prev => ({ ...prev, cargo: '' }));
      }
    }
  }, [formData.tipoDiretoria, formData.cargo]);

  const getFilteredCargos = () => {
    if (formData.tipoDiretoria === 'UPH') {
      return ['Presidente', 'Vice-Presidente', '1º Secretário', '2º Secretário', 'Tesoureiro', 'Conselheiro'];
    }
    if (formData.tipoDiretoria === 'Federação') {
      return ['Presidente', 'Vice-Presidente', 'Secretário Executivo', '1º Secretário', '2º Secretário', 'Tesoureiro', 'Sec. Presbiterial'];
    }
    if (formData.tipoDiretoria === 'Sinodal') {
      return ['Presidente', 'Vice-Presidente', 'Secretário Executivo', '1º Secretário', '2º Secretário', 'Tesoureiro', 'Sec. Sinodal'];
    }
    return cargos;
  };

  const handleFileChange = (e) => {
    setFotoFile(e.target.files[0]);
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const name = e.target.name;

    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Reset entidade if tipo changes
      if (name === 'tipoDiretoria') {
        updated.entidade_id = '';
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const typeMapping = {
      'UPH': 'uph',
      'Federação': 'federacao',
      'Sinodal': 'sinodal'
    };
    const mappedTipo = typeMapping[formData.tipoDiretoria];

    let uploadedFotoUrl = null;

    // 1. Upload photo to Supabase Storage if selected
    if (fotoFile) {
      try {
        const fileExt = fotoFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `membros/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('diretoria')
          .upload(filePath, fotoFile);

        if (uploadError) {
          console.warn('Storage bucket directory may not exist, trying to upload:', uploadError.message);
          // Proceed anyway or throw
        } else {
          const { data } = supabase.storage.from('diretoria').getPublicUrl(filePath);
          uploadedFotoUrl = data?.publicUrl || null;
        }
      } catch (uploadErr) {
        console.error('File upload process failed:', uploadErr);
      }
    }

    // 2. Insert record
    const { error: insertError } = await supabase.from('membros_diretoria').insert({
      tipo_entidade: mappedTipo,
      entidade_id: formData.entidade_id,
      cargo: formData.cargo,
      oficio: formData.oficio,
      inicio_mandato: parseInt(formData.anoInicio, 10),
      fim_mandato: parseInt(formData.anoFim, 10),
      nome: formData.nome,
      telefone: formData.telefone,
      whatsapp: formData.whatsapp,
      email: formData.email,
      data_nascimento: formData.nascimento,
      foto_url: uploadedFotoUrl
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    alert('Cadastrado com sucesso');
    setFotoFile(null);
    // Reset file input element
    const fileInput = document.getElementById('foto');
    if (fileInput) fileInput.value = '';

    setFormData({
      tipoDiretoria: '', entidade_id: '', cargo: '', anoInicio: '', anoFim: '', 
      oficio: '', nome: '', telefone: '', whatsapp: false, email: '', nascimento: ''
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Cadastro de Diretorias</h1>
      <form className={styles.formCard} onSubmit={handleSubmit}>
        
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="tipoDiretoria">Tipo de diretoria</label>
          <select id="tipoDiretoria" name="tipoDiretoria" className={styles.select} value={formData.tipoDiretoria} onChange={handleChange} required>
            <option value="">Selecione o tipo</option>
            {tiposDiretoria.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="entidade_id">Entidade</label>
          <select id="entidade_id" name="entidade_id" className={styles.select} value={formData.entidade_id} onChange={handleChange} required disabled={!formData.tipoDiretoria}>
            <option value="">Selecione a entidade</option>
            {entidadesOptions.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="cargo">Cargo</label>
          <select id="cargo" name="cargo" className={styles.select} value={formData.cargo} onChange={handleChange} required>
            <option value="">Selecione o cargo</option>
            {getFilteredCargos().map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div className={styles.inputGroup} style={{ flex: 1 }}>
            <label className={styles.label} htmlFor="anoInicio">Ano início</label>
            <input type="number" id="anoInicio" name="anoInicio" className={styles.input} value={formData.anoInicio} onChange={handleChange} placeholder="Ex: 2024" required />
          </div>
          <div className={styles.inputGroup} style={{ flex: 1 }}>
            <label className={styles.label} htmlFor="anoFim">Ano fim</label>
            <input type="number" id="anoFim" name="anoFim" className={styles.input} value={formData.anoFim} onChange={handleChange} placeholder="Ex: 2025" required />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="oficio">Ofício</label>
          <select id="oficio" name="oficio" className={styles.select} value={formData.oficio} onChange={handleChange} required>
            <option value="">Selecione o ofício</option>
            {oficios.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="nome">Nome completo</label>
          <input type="text" id="nome" name="nome" className={styles.input} value={formData.nome} onChange={handleChange} required />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="telefone">Telefone</label>
          <input type="text" id="telefone" name="telefone" className={styles.input} value={formData.telefone} onChange={handleChange} placeholder="(XX) XXXXX-XXXX" required />
        </div>

        <div className={styles.checkboxGroup}>
          <input type="checkbox" id="whatsapp" name="whatsapp" className={styles.checkbox} checked={formData.whatsapp} onChange={handleChange} />
          <label htmlFor="whatsapp">É WhatsApp?</label>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="email">E-mail</label>
          <input type="email" id="email" name="email" className={styles.input} value={formData.email} onChange={handleChange} required />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="nascimento">Data de Nascimento</label>
          <input type="date" id="nascimento" name="nascimento" className={styles.input} value={formData.nascimento} onChange={handleChange} required />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="foto">Foto do Membro (Opcional)</label>
          <input type="file" id="foto" name="foto" accept="image/*" className={styles.input} onChange={handleFileChange} style={{ paddingTop: '8px' }} />
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
