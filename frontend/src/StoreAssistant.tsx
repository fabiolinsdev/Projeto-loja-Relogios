import { FormEvent, useEffect, useRef, useState } from 'react'
import {
  answerStoreQuestion,
  assistantWelcome,
  type AssistantCartItem,
  type AssistantProduct,
} from './storeAssistant'

type ChatMessage = {
  id: number
  from: 'agent' | 'client'
  text: string
}

type StoreAssistantProps = {
  products: AssistantProduct[]
  cart: AssistantCartItem[]
  loggedIn: boolean
}

const SUGGESTIONS = [
  'Quais relógios vocês têm?',
  'O que tem no carrinho?',
  'Como finalizo a compra?',
]

export function StoreAssistant({
  products,
  cart,
  loggedIn,
}: StoreAssistantProps) {
  const [open, setOpen] = useState(true)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, from: 'agent', text: assistantWelcome },
  ])
  const nextId = useRef(2)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, open])

  function sendQuestion(question: string) {
    const text = question.trim()

    if (!text) {
      return
    }

    const clientMessage: ChatMessage = {
      id: nextId.current++,
      from: 'client',
      text,
    }

    const reply: ChatMessage = {
      id: nextId.current++,
      from: 'agent',
      text: answerStoreQuestion(text, products, cart, loggedIn),
    }

    setMessages((current) => [...current, clientMessage, reply])
    setInput('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    sendQuestion(input)
  }

  return (
    <div className="store-assistant">
      {open ? (
        <section className="store-assistant-panel" aria-label="Assistente da loja">
          <header className="store-assistant-header">
            <div>
              <p className="store-assistant-kicker">Assistente</p>
              <h2>Loja Relógios</h2>
            </div>
            <button
              type="button"
              className="store-assistant-icon-button"
              onClick={() => setOpen(false)}
              aria-label="Minimizar assistente"
            >
              −
            </button>
          </header>

          <div className="store-assistant-messages" ref={listRef}>
            {messages.map((message) => (
              <p
                key={message.id}
                className={`store-assistant-bubble store-assistant-bubble-${message.from}`}
              >
                {message.text}
              </p>
            ))}
          </div>

          <div className="store-assistant-suggestions">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => sendQuestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form className="store-assistant-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Pergunte sobre um relógio ou o carrinho"
              aria-label="Pergunta para o assistente"
            />
            <button type="submit">Enviar</button>
          </form>
        </section>
      ) : (
        <button
          type="button"
          className="store-assistant-launcher"
          onClick={() => setOpen(true)}
        >
          ⌚ Ajuda
        </button>
      )}
    </div>
  )
}
