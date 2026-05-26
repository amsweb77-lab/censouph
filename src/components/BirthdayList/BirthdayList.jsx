import { MdPerson, MdPhone } from 'react-icons/md'
import styles from './BirthdayList.module.css'

export default function BirthdayList({ membros }) {
  if (!membros || membros.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>Nenhum aniversariante encontrado.</div>
      </div>
    )
  }

  // Função para calcular a idade
  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return ''
    const hoje = new Date()
    const nascimento = new Date(dataNascimento)
    let idade = hoje.getFullYear() - nascimento.getFullYear()
    const m = hoje.getMonth() - nascimento.getMonth()
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--
    }
    return `${idade} anos`
  }

  return (
    <div className={styles.container}>
      {membros.map((membro) => (
        <div key={membro.id} className={styles.item}>
          {membro.foto_url ? (
            <img src={membro.foto_url} alt={membro.nome} className={styles.avatar} />
          ) : (
            <div className={styles.avatar}>
              <MdPerson size={24} />
            </div>
          )}
          
          <div className={styles.info}>
            <div className={styles.name}>{membro.nome}</div>
            <div className={styles.age}>{calcularIdade(membro.data_nascimento)}</div>
          </div>

          {membro.telefone && (
            <a 
              href={membro.whatsapp ? `https://wa.me/55${membro.telefone.replace(/\D/g,'')}` : `tel:${membro.telefone.replace(/\D/g,'')}`} 
              className={styles.callButton}
              target="_blank"
              rel="noopener noreferrer"
              style={{ borderRadius: '20px 8px 20px 8px' }}
            >
              <MdPhone size={20} />
            </a>
          )}
        </div>
      ))}
    </div>
  )
}
