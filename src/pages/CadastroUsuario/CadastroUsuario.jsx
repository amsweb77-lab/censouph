import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { regioes as mockRegioes } from '../../data/mockData'
import styles from './CadastroUsuario.module.css'

export default function CadastroUsuario() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [dbRegioes, setDbRegioes] = useState([])
  const [regiao, setRegiao] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  const navigate = useNavigate()

  useEffect(() => {
    async function loadRegioes() {
      try {
        const { data, error } = await supabase.from('regioes').select('id, nome')
        if (error) throw error
        if (data && data.length > 0) {
          const customOrder = ['Norte I', 'Norte II', 'Nordeste', 'Centro-Oeste', 'Sul', 'Sudeste I', 'Sudeste II'];
          const sorted = [...data].sort((a, b) => {
            const indexA = customOrder.indexOf(a.nome);
            const indexB = customOrder.indexOf(b.nome);
            return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
          });
          setDbRegioes(sorted)
        }
      } catch (err) {
        console.warn('Erro ao carregar regiões do banco de dados, usando mock:', err)
      }
    }
    loadRegioes()
  }, [])

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      return setError('As senhas não coincidem.')
    }
    if (!regiao) {
      return setError('Por favor, selecione uma região.')
    }

    setLoading(true)

    // Supabase auth register
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome_completo: nome
        }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data?.user) {
      // Find region UUID or set null
      const selectedDbRegion = dbRegioes.find(r => r.id === regiao || r.nome === regiao)
      const regiaoId = selectedDbRegion ? selectedDbRegion.id : null

      // Manual insert into 'perfis'
      const { error: profileError } = await supabase.from('perfis').insert({
        id: data.user.id,
        nome_completo: nome,
        regiao_id: regiaoId,
        nivel_acesso: 'usuario',
        status: 'pendente'
      })

      if (profileError) {
        console.error('Erro ao inserir perfil:', profileError)
        // If it fails to insert profile (maybe RLS or trigger exists), don't break the flow completely but warn the user
        setError('Cadastro de login criado, mas não foi possível salvar o perfil: ' + profileError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } else {
      setError('Erro desconhecido ao criar usuário.')
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.form}>
          <h3 className={styles.success}>Cadastro realizado com sucesso!</h3>
          <p style={{textAlign: 'center'}}>Você será redirecionado para o login.</p>
        </div>
      </div>
    )
  }

  // Fallback to mock regions if db is empty/error
  const regionsList = dbRegioes.length > 0 
    ? dbRegioes.map(r => ({ id: r.id, nome: r.nome }))
    : mockRegioes.map(name => ({ id: name, nome: name }))

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Cadastro de Usuário</h2>
      <form onSubmit={handleRegister} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.inputGroup}>
          <label className={styles.label}>Nome Completo</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} className={styles.input} required />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>E-mail (Login)</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles.input} required />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Região</label>
          <select value={regiao} onChange={(e) => setRegiao(e.target.value)} className={styles.input} required>
            <option value="">Selecione a Região</option>
            {regionsList.map(r => (
              <option key={r.id} value={r.id}>{r.nome}</option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} required minLength="6" />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Confirmar Senha</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={styles.input} required minLength="6" />
        </div>

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
        <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
          Voltar
        </button>
      </form>
    </div>
  )
}
