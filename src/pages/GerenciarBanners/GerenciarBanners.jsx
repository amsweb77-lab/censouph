import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdDelete, MdAdd, MdSave } from 'react-icons/md';
import styles from './GerenciarBanners.module.css';

// Default initial banners if localStorage is empty
const defaultBanners = [
  {
    id: 1,
    text: 'CLIQUE AQUI E CONHEÇA A NOVA Revista da UPH',
    gradient: 'linear-gradient(135deg, #1B5E20 0%, #0D47A1 100%)',
    url: 'https://www.uph.org.br/revista-da-uph',
  },
  {
    id: 2,
    text: 'VISITE O SITE OFICIAL DA UPH',
    gradient: 'linear-gradient(135deg, #0D47A1 0%, #1B5E20 100%)',
    url: 'https://www.uph.org.br',
  },
];

const gradientOptions = [
  { label: 'Verde e Azul (Revista)', value: 'linear-gradient(135deg, #1B5E20 0%, #0D47A1 100%)' },
  { label: 'Azul e Verde (Oficial)', value: 'linear-gradient(135deg, #0D47A1 0%, #1B5E20 100%)' },
  { label: 'Laranja e Vermelho (Destaque)', value: 'linear-gradient(135deg, #FF5722 0%, #BF360C 100%)' },
  { label: 'Roxo e Azul (Unidade)', value: 'linear-gradient(135deg, #4A148C 0%, #0D47A1 100%)' },
  { label: 'Dourado Cerrado (Alerta)', value: 'linear-gradient(135deg, #FFC107 0%, #E65100 100%)' },
];

export default function GerenciarBanners() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  
  // Form states
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [gradient, setGradient] = useState(gradientOptions[0].value);
  const [useImage, setUseImage] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('secnhp_banners');
    if (saved) {
      setBanners(JSON.parse(saved));
    } else {
      setBanners(defaultBanners);
      localStorage.setItem('secnhp_banners', JSON.stringify(defaultBanners));
    }
  }, []);

  const saveBanners = (updatedList) => {
    setBanners(updatedList);
    localStorage.setItem('secnhp_banners', JSON.stringify(updatedList));
  };

  const handleAddBanner = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newBanner = {
      id: Date.now(),
      text: text.trim(),
      url: url.trim() || '#',
      gradient: useImage ? 'none' : gradient,
      imageUrl: useImage ? imageUrl.trim() : null
    };

    const updated = [...banners, newBanner];
    saveBanners(updated);

    // Reset Form
    setText('');
    setUrl('');
    setImageUrl('');
    setUseImage(false);
  };

  const handleDeleteBanner = (id) => {
    const updated = banners.filter(b => b.id !== id);
    saveBanners(updated);
  };

  return (
    <div className={styles.page}>
      <div className={styles.customHeader}>
        <button className={styles.backIconButton} onClick={() => navigate('/menu')}>
          <MdArrowBack size={24} />
        </button>
        <span className={styles.headerTitle}>Administrador - Gerenciar Banners</span>
      </div>

      <div className={styles.container}>
        <h1 className={styles.mainTitle}>PAINEL DO ADMINISTRADOR</h1>
        <h2 className={styles.subTitle}>Gerenciar Carrossel de Banners</h2>

        {/* Create Banner Form */}
        <form onSubmit={handleAddBanner} className={styles.formCard}>
          <h3 className={styles.cardTitle}>Novo Banner</h3>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Informação (Texto Exibido)</label>
            <input 
              type="text" 
              className={styles.input}
              placeholder="Ex: CLIQUE AQUI E CONHEÇA A NOVA Revista da UPH"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Link de Acesso (URL)</label>
            <input 
              type="url" 
              className={styles.input}
              placeholder="Ex: https://www.uph.org.br/revista"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          {/* Toggle background type */}
          <div className={styles.toggleGroup}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${!useImage ? styles.toggleActive : ''}`}
              onClick={() => setUseImage(false)}
            >
              Fundo Gradiente
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${useImage ? styles.toggleActive : ''}`}
              onClick={() => setUseImage(true)}
            >
              Fundo Imagem/Foto
            </button>
          </div>

          {!useImage ? (
            <div className={styles.formGroup}>
              <label className={styles.label}>Escolha o Estilo (Gradiente)</label>
              <select 
                className={styles.select}
                value={gradient}
                onChange={(e) => setGradient(e.target.value)}
              >
                {gradientOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className={styles.formGroup}>
              <label className={styles.label}>URL da Foto/Imagem de Fundo</label>
              <input 
                type="url" 
                className={styles.input}
                placeholder="Ex: https://site.com/imagem.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required={useImage}
              />
            </div>
          )}

          {/* Banner Live Preview */}
          <div className={styles.previewContainer}>
            <span className={styles.previewLabel}>Pré-visualização ao vivo:</span>
            <div 
              className={styles.bannerPreview}
              style={{
                background: useImage ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${imageUrl}) center/cover no-repeat` : gradient
              }}
            >
              <span className={styles.previewText}>
                {text || 'TEXTO DE PRÉ-VISUALIZAÇÃO DO BANNER'}
              </span>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>
            <MdAdd size={20} />
            <span>Adicionar Banner</span>
          </button>
        </form>

        {/* Existing Banners List */}
        <section className={styles.bannersListSection}>
          <h3 className={styles.sectionTitle}>Banners Ativos ({banners.length})</h3>
          {banners.length === 0 ? (
            <p className={styles.emptyText}>Nenhum banner ativo. Adicione um acima.</p>
          ) : (
            <div className={styles.bannersList}>
              {banners.map((banner) => (
                <div key={banner.id} className={styles.bannerRow}>
                  <div 
                    className={styles.bannerThumb}
                    style={{
                      background: banner.imageUrl ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${banner.imageUrl}) center/cover no-repeat` : banner.gradient
                    }}
                  >
                    <span className={styles.thumbText}>{banner.text}</span>
                  </div>
                  <div className={styles.bannerInfo}>
                    <span className={styles.bannerLink} title={banner.url}>{banner.url}</span>
                    <button 
                      className={styles.deleteBtn}
                      onClick={() => handleDeleteBanner(banner.id)}
                      aria-label="Excluir banner"
                    >
                      <MdDelete size={16} />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
