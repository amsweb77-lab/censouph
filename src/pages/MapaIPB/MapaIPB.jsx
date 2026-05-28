import React from 'react';
import { MdOpenInNew, MdAccountBalance, MdChurch, MdMap } from 'react-icons/md';
import styles from './MapaIPB.module.css';

export default function MapaIPB() {
  const mapUrl = "https://www.icalvinus.app/ipb-no-brasil/mapa-geral/";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Mapa IPB</h1>
        <p className={styles.subtitle}>
          Visualize a presença da Igreja Presbiteriana do Brasil em todo o território nacional
        </p>
        
        <div className={styles.actionsRow}>
          <button 
            className={styles.fullscreenBtn} 
            onClick={() => window.open(mapUrl, '_blank')}
          >
            <MdOpenInNew size={16} />
            <span>Abrir em tela cheia</span>
          </button>
        </div>

        <div className={styles.indicators}>
          <span className={styles.pill}>
            <MdAccountBalance size={14} className={styles.pillIcon} />
            <span>Igrejas</span>
          </span>
          <span className={styles.pill}>
            <MdChurch size={14} className={styles.pillIcon} />
            <span>Presbitérios</span>
          </span>
          <span className={styles.pill}>
            <MdMap size={14} className={styles.pillIcon} />
            <span>Sínodos</span>
          </span>
        </div>
      </header>

      <div className={styles.mapWrapper}>
        <iframe 
          src={mapUrl} 
          className={styles.iframe}
          title="Mapa Geral IPB"
          allowFullScreen
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
}
