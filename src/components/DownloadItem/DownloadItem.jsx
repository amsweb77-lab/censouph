import { MdFileDownload } from 'react-icons/md';
import styles from './DownloadItem.module.css';

function DownloadItem({ titulo, tipo, onClick }) {
  return (
    <div
      className={styles.item}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className={styles.info}>
        <span className={styles.titulo}>{titulo}</span>
        {tipo && <span className={styles.tipo}>{tipo}</span>}
      </div>
      <span className={styles.iconWrapper}>
        <MdFileDownload size={24} />
      </span>
    </div>
  );
}

export default DownloadItem;
