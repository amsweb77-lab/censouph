import styles from './Mapa.module.css'

export default function Mapa() {
  return (
    <div className={styles.container}>
      <iframe 
        src="https://www.icalvinus.app/ipb-no-brasil/mapa-geral/" 
        className={styles.iframe}
        title="Mapa Geral IPB"
        allowFullScreen
        loading="lazy"
      ></iframe>
    </div>
  )
}
