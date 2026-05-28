import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdDelete, MdAdd, MdSave, MdFileUpload, MdEdit } from 'react-icons/md';
import styles from './GerenciarBanners.module.css';

// Default initial banners if localStorage is empty
const defaultBanners = [
  {
    id: 1,
    text: 'XVI CONGRESSO DA CNHP',
    subheadline: 'Confira o Resumo Oficial: Destaques, comissões e os rumos definidos em nosso encontro.',
    ctaText: 'Baixar Boletim Completo',
    gradient: 'linear-gradient(135deg, #1B5E20 0%, #0D47A1 100%)',
    url: 'https://online.fliphtml5.com/CNHP2026/XVI-BOLETIM-INFORMATIVO/#p=1',
    pdfUrl: 'https://online.fliphtml5.com/CNHP2026/XVI-BOLETIM-INFORMATIVO/#p=1',
  },
  {
    id: 2,
    text: 'CLIQUE AQUI E CONHEÇA A NOVA Revista da UPH',
    gradient: 'linear-gradient(135deg, #1B5E20 0%, #0D47A1 100%)',
    url: 'https://www.uph.org.br/revista-da-uph',
  },
  {
    id: 3,
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

// Helper to resize and compress uploaded images to prevent localStorage overflow
const resizeAndCompressImage = (file, maxWidth = 1600, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize proportionally if width exceeds maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG format
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function GerenciarBanners() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  
  // Form states
  const [text, setText] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [url, setUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [gradient, setGradient] = useState(gradientOptions[0].value);
  const [useImage, setUseImage] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('secnhp_banners_v3');
    if (saved) {
      setBanners(JSON.parse(saved));
    } else {
      setBanners(defaultBanners);
      localStorage.setItem('secnhp_banners_v3', JSON.stringify(defaultBanners));
    }
  }, []);

  const saveBanners = (updatedList) => {
    setBanners(updatedList);
    localStorage.setItem('secnhp_banners_v3', JSON.stringify(updatedList));
  };

  const handleAddBanner = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (editingId !== null) {
      const updated = banners.map(b => {
        if (b.id === editingId) {
          return {
            ...b,
            text: text.trim(),
            subheadline: subheadline.trim() || null,
            ctaText: ctaText.trim() || null,
            url: url.trim() || '#',
            pdfUrl: pdfUrl.trim() || null,
            gradient: useImage ? 'none' : gradient,
            imageUrl: useImage ? imageUrl.trim() : null
          };
        }
        return b;
      });
      saveBanners(updated);
      setEditingId(null);
    } else {
      const newBanner = {
        id: Date.now(),
        text: text.trim(),
        subheadline: subheadline.trim() || null,
        ctaText: ctaText.trim() || null,
        url: url.trim() || '#',
        pdfUrl: pdfUrl.trim() || null,
        gradient: useImage ? 'none' : gradient,
        imageUrl: useImage ? imageUrl.trim() : null
      };
      const updated = [...banners, newBanner];
      saveBanners(updated);
    }

    // Reset Form
    setText('');
    setSubheadline('');
    setCtaText('');
    setUrl('');
    setPdfUrl('');
    setImageUrl('');
    setUseImage(false);
  };

  const handleDeleteBanner = (id) => {
    const updated = banners.filter(b => b.id !== id);
    saveBanners(updated);
    if (editingId === id) {
      setEditingId(null);
      setText('');
      setSubheadline('');
      setCtaText('');
      setUrl('');
      setPdfUrl('');
      setImageUrl('');
      setUseImage(false);
    }
  };

  const handleEditClick = (banner) => {
    setEditingId(banner.id);
    setText(banner.text);
    setSubheadline(banner.subheadline || '');
    setCtaText(banner.ctaText || '');
    setUrl(banner.url === '#' ? '' : (banner.url || ''));
    setPdfUrl(banner.pdfUrl || '');
    if (banner.imageUrl) {
      setUseImage(true);
      setImageUrl(banner.imageUrl);
    } else {
      setUseImage(false);
      setGradient(banner.gradient || gradientOptions[0].value);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Automatically resize to max 1600px width and compress to 75% quality JPEG
      const compressedDataUrl = await resizeAndCompressImage(file, 1600, 0.75);
      setImageUrl(compressedDataUrl);
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      alert('Ocorreu um erro ao processar a imagem. Por favor, tente outro arquivo.');
    }
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
            <label className={styles.label}>Título Principal (Headline / Texto Exibido)</label>
            <input 
              type="text" 
              className={styles.input}
              placeholder="Ex: XVI CONGRESSO DA CNHP"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Subtítulo (Subheadline - Opcional)</label>
            <input 
              type="text" 
              className={styles.input}
              placeholder="Ex: Confira o Resumo Oficial: Destaques, comissões..."
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Texto do Botão / CTA (Opcional)</label>
            <input 
              type="text" 
              className={styles.input}
              placeholder="Ex: Ler Resumo em PDF"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Link de Acesso (URL)</label>
            <input 
              type="url" 
              className={styles.input}
              placeholder="Ex: https://online.fliphtml5.com/CNHP2026/XVI-BOLETIM-INFORMATIVO/#p=1"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Link de Download do PDF (Opcional - Usado no botão de ação)</label>
            <input 
              type="url" 
              className={styles.input}
              placeholder="Cole o link direto do arquivo PDF..."
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
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
              <label className={styles.label}>Foto/Imagem de Fundo (Link ou Arquivo)</label>
              <div className={styles.uploadContainer}>
                <input 
                  type="text" 
                  className={styles.input}
                  placeholder="Cole o link da imagem OU faça upload ao lado..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required={useImage}
                />
                <label className={styles.uploadBtn}>
                  <MdFileUpload size={20} />
                  <span>Upload</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Banner Live Preview */}
          <div className={styles.previewContainer}>
            <span className={styles.previewLabel}>Pré-visualização ao vivo:</span>
            <div 
              className={styles.bannerPreview}
              style={{
                background: useImage ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${imageUrl}) center/cover no-repeat` : gradient
              }}
            >
              <div className={styles.previewContent}>
                <span className={styles.previewHeadline}>
                  {text || 'TEXTO DE PRÉ-VISUALIZAÇÃO DO BANNER'}
                </span>
                {subheadline && (
                  <span className={styles.previewSubheadline}>{subheadline}</span>
                )}
                {ctaText && (
                  <span className={styles.previewCtaBtn}>{ctaText}</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.actionButtonsRow}>
            <button type="submit" className={styles.submitBtn}>
              {editingId !== null ? <MdSave size={20} /> : <MdAdd size={20} />}
              <span>{editingId !== null ? 'Salvar Alterações' : 'Adicionar Banner'}</span>
            </button>
            {editingId !== null && (
              <button 
                type="button" 
                className={styles.cancelEditBtn}
                onClick={() => {
                  setEditingId(null);
                  setText('');
                  setSubheadline('');
                  setCtaText('');
                  setUrl('');
                  setImageUrl('');
                  setUseImage(false);
                }}
              >
                Cancelar Edição
              </button>
            )}
          </div>
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
                    <div className={styles.bannerActions}>
                      <button 
                        className={styles.editBtn}
                        onClick={() => handleEditClick(banner)}
                        aria-label="Editar banner"
                      >
                        <MdEdit size={16} />
                        <span>Editar</span>
                      </button>
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
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
