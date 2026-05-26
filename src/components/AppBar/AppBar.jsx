import { MdArrowBack } from 'react-icons/md';
import styles from './AppBar.module.css';

function AppBar({ title, showBack = false, onBack }) {
  return (
    <header className={styles.appBar}>
      {showBack && (
        <button
          className={styles.backButton}
          onClick={onBack}
          aria-label="Voltar"
          type="button"
        >
          <MdArrowBack size={24} />
        </button>
      )}
      <h1 className={styles.title}>{title}</h1>
    </header>
  );
}

export default AppBar;
