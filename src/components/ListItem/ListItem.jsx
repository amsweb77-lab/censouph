import { MdChevronRight } from 'react-icons/md';
import styles from './ListItem.module.css';

function ListItem({ label, onClick, disabled }) {
  return (
    <button
      className={`${styles.item} ${disabled ? styles.disabled : ''}`}
      onClick={disabled ? null : onClick}
      type="button"
      disabled={disabled}
    >
      <span className={styles.label}>{label}</span>
      <MdChevronRight size={24} className={styles.chevron} />
    </button>
  );
}

export default ListItem;
