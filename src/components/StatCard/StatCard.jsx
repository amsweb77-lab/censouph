import styles from './StatCard.module.css';

const variantColors = {
  dark: '#1B5E20',
  medium: '#388E3C',
  olive: '#558B2F',
  green: '#4CAF50',
  inactive: '#78909C',
};

function StatCard({ label, value, variant = 'dark', onClick }) {
  const bgColor = variantColors[variant] || variantColors.dark;

  return (
    <div
      className={styles.card}
      style={{ backgroundColor: bgColor }}
      onClick={onClick}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}

export default StatCard;
