import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import styles from './Login.module.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      navigate('/menu')
    }
    
    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Login</h2>
      <form onSubmit={handleLogin} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.inputGroup}>
          <label className={styles.label}>E-mail</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
            placeholder="Seu e-mail"
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Senha</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
            placeholder="Sua senha"
          />
        </div>

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <div className={styles.links}>
          <Link to="/cadastro-usuario" className={styles.link}>
            Quero me cadastrar
          </Link>
          <button type="button" className={styles.link} onClick={() => alert('Em breve')}>
            Esqueci minha senha
          </button>
        </div>
      </form>
    </div>
  )
}
