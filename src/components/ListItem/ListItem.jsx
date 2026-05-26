import { MdChevronRight } from 'react-icons/md';
import styles from './ListItem.module.css';

function ListItem({ label, onClick }) {
  return (
    <button
      className={styles.item}
      onClick={onClick}
      type="button"
    >
      <span className={styles.label}>{label}</span>
      <MdChevronRight size={24} className={styles.chevron} />
    </button>
  );
}

export default ListItem;
