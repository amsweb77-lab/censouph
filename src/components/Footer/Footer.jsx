import React from 'react';
import { FaEnvelope, FaWhatsapp, FaGlobe, FaFacebook } from 'react-icons/fa';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        {/* Left Column */}
        <div className={styles.column}>
          <div className={styles.item}>
            <FaEnvelope className={styles.icon} />
            <a href="mailto:sec.executivo@uph.org.br" className={styles.link}>
              sec.executivo@uph.org.br
            </a>
          </div>
          <div className={styles.item}>
            <FaWhatsapp className={styles.icon} />
            <a href="https://wa.me/5598987409175" target="_blank" rel="noopener noreferrer" className={styles.link}>
              (98) 98740-9175
            </a>
          </div>
          <div className={styles.item}>
            <FaGlobe className={styles.icon} />
            <a href="https://secnhp.org" target="_blank" rel="noopener noreferrer" className={styles.link}>
              https://secnhp.org
            </a>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.column}>
          <div className={styles.item}>
            <FaEnvelope className={styles.icon} />
            <a href="mailto:contato@uph.org.br" className={styles.link}>
              contato@uph.org.br
            </a>
          </div>
          <div className={styles.item}>
            <FaFacebook className={styles.icon} />
            <a href="https://facebook.com/cnhpoficial" target="_blank" rel="noopener noreferrer" className={styles.link}>
              /cnhpoficial
            </a>
          </div>
          <div className={styles.item}>
            <FaGlobe className={styles.icon} />
            <a href="https://www.uph.org.br" target="_blank" rel="noopener noreferrer" className={styles.link}>
              https://www.uph.org.br
            </a>
          </div>
        </div>
      </div>

      {/* Motto Line */}
      <div className={styles.motto}>
        CONFIANÇA EM JESUS, ENTUSIASMO NA AÇÃO, UNIÃO FRATERNAL - CEU!
      </div>
    </footer>
  );
}
