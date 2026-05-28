import styles from './MapaIPB.module.css';
import { MdOpenInNew } from 'react-icons/md';

export default function MapaIPB() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Mapa IPB</h1>
        <p className={styles.pageSubtitle}>
          Visualize a presença da Igreja Presbiteriana do Brasil em todo o território nacional
        </p>
        <a
          href="https://www.icalvinus.app/ipb-no-brasil/mapa-geral/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.externalLink}
        >
          <MdOpenInNew size={16} />
          Abrir em tela cheia
        </a>
      </div>

      {/* Map Tabs Info */}
      <div className={styles.infoRow}>
        <div className={styles.infoChip}>🏛️ Igrejas</div>
        <div className={styles.infoChip}>⛪ Presbitérios</div>
        <div className={styles.infoChip}>🗺️ Sínodos</div>
      </div>

      {/* Map iframe */}
      <div className={styles.mapContainer}>
        <iframe
          src="https://www.icalvinus.app/ipb-no-brasil/mapa-geral/"
          title="Mapa Geral IPB no Brasil"
          allowFullScreen
          loading="lazy"
          className={styles.mapIframe}
        />
      </div>

      {/* Footer note */}
      <p className={styles.footerNote}>
        Fonte: <a href="https://www.icalvinus.app" target="_blank" rel="noopener noreferrer">iCalvinus</a> — Dados da IPB no Brasil
      </p>
    </div>
  );
}
