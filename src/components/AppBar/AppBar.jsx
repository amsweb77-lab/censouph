import { MdArrowBack, MdMenu } from 'react-icons/md';
import styles from './AppBar.module.css';

function AppBar({ title, showBack = false, onBack, onMenuToggle }) {
  return (
    <header className={styles.appBar}>
      <div className={styles.left}>
        {showBack ? (
          <button
            className={styles.iconButton}
            onClick={onBack}
            aria-label="Voltar"
            type="button"
          >
            <MdArrowBack size={24} />
          </button>
        ) : (
          <button
            className={styles.iconButton}
            onClick={onMenuToggle}
            aria-label="Abrir menu"
            type="button"
            id="hamburger-btn"
          >
            <MdMenu size={26} />
          </button>
        )}
      </div>

      <div className={styles.titleContainer}>
        <img src="/logo.png" alt="Logo UPH" className={styles.logo} />
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.right} />
    </header>
  );
}

export default AppBar;
