import styles from './NewsCard.module.css';

function NewsCard({ title, image, date, variant = 'horizontal', onClick }) {
  const isHorizontal = variant === 'horizontal';

  return (
    <article
      className={`${styles.card} ${isHorizontal ? styles.horizontal : styles.list}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {image && (
        <div className={styles.imageWrapper}>
          <img
            className={styles.image}
            src={image}
            alt={title}
            loading="lazy"
          />
        </div>
      )}
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        {date && <span className={styles.date}>{date}</span>}
      </div>
    </article>
  );
}

export default NewsCard;
