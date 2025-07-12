import { useState } from 'react'
import { gamePrompts } from '../prompts'
import showdown from 'showdown'

export function FormSection() {
  const [apiKey, setApiKey] = useState('')
  const [game, setGame] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const converter = new showdown.Converter()

  const perguntarAI = async () => {
    const prompt = (gamePrompts[game] ?? `
## Especialidade
Você é um assistente especialista em meta do jogo **${game}**.
...
Pergunta do usuário: `) + question

    try {
      const model = "gemini-2.0-flash"
      const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

      const contents = [{
        role: "user",
        parts: [{ text: prompt }]
      }]
      const tools = [{ google_search: {} }]

      const response = await fetch(geminiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, tools })
      })

      const data = await response.json()

      if (!response.ok || !data.candidates) {
        throw new Error(data.error?.message || 'Erro inesperado na API.')
      }

      const respostaTexto = data.candidates[0]?.content?.parts?.[0]?.text || 'Resposta vazia.'
      setAnswer(converter.makeHtml(respostaTexto))
    } catch (err) {
      setAnswer(`<p style="color: red;">${err.message}</p>`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!apiKey || !game || !question) return alert('Preencha todos os campos.')
    setLoading(true)
    setAnswer('')
    perguntarAI()
  }

  return (
    <section>
      <div>
        <h2 className="title">Assistente de Meta</h2>
        <p>Pergunte sobre estratégias, builds e dicas para seus jogos!</p>

        <form onSubmit={handleSubmit}>
          <input type="password" placeholder="Insira a API KEY do Gemini" value={apiKey} onChange={e => setApiKey(e.target.value)} required />

          <select value={game} onChange={e => setGame(e.target.value)} required>
            <option value="">Selecione um jogo</option>
            <option value="vava">Valorant</option>
            <option value="lol">League of Legends</option>
            <option value="cs">Counter-Strike 2</option>
            <option value="mine">Minecraft</option>
            <option value="cod">Call of Duty: Warzone</option>
            <option value="d4">Diablo IV</option>
            <option value="r6s">Rainbow Six Siege</option>
            <option value="gi">Genshin Impact</option>
            <option value="pubg">PUBG: Battlegrounds</option>
          </select>

          <input type="text" placeholder="Ex.: melhor build para ADC..." value={question} onChange={e => setQuestion(e.target.value)} required />

          <button type="submit" disabled={loading}>{loading ? 'Perguntando...' : 'Perguntar'}</button>
        </form>

        {answer && (
          <div id="aiResponse" className="response" dangerouslySetInnerHTML={{ __html: answer }} />
        )}
      </div>
    </section>
  )
}