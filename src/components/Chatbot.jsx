import { useState, useEffect, useRef } from 'react'
import { chatAPI } from '../services/api'
import { FaComment, FaUser, FaTimes, FaPaperPlane } from 'react-icons/fa'
import './Chatbot.css'

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(() => {
    // Load messages from localStorage or use default
    const stored = localStorage.getItem('chatMessages')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return [
          {
            id: 1,
            text: 'Hello! How can I help you today?',
            sender: 'admin',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }
    }
    return [
      {
        id: 1,
        text: 'Hello! How can I help you today?',
        sender: 'admin',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }
    ]
  })
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => localStorage.getItem('chatSessionId') || `session_${Date.now()}`)
  const messagesEndRef = useRef(null)
  
  // Save session ID to localStorage
  useEffect(() => {
    if (!localStorage.getItem('chatSessionId')) {
      localStorage.setItem('chatSessionId', sessionId)
    }
  }, [sessionId])
  
  // Check if backend is available
  const [useBackend, setUseBackend] = useState(false)
  
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health')
        const data = await response.json()
        console.log('Backend health check:', data)
        
        if (data.database === 'connected') {
          setUseBackend(true)
          // Try to get existing session from backend
          try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}')
            const userId = userData._id || userData.id || null
            console.log('Getting chat session for:', sessionId, 'userId:', userId)
            const chat = await chatAPI.getOrCreateSession(sessionId, userId)
            console.log('Chat session:', chat)
            if (chat && chat.messages) {
              setMessages(chat.messages)
              localStorage.setItem('chatMessages', JSON.stringify(chat.messages))
            }
          } catch (err) {
            console.log('Using local chat storage:', err.message)
          }
        } else {
          console.log('Database not connected, using local storage')
          setUseBackend(false)
        }
      } catch (err) {
        console.log('Backend not available, using local storage')
        setUseBackend(false)
      }
    }
    checkBackend()
  }, [sessionId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const newMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages))
    setInputText('')
    setIsLoading(true)

    try {
      if (useBackend) {
        // Send to backend API
        console.log('Sending message to backend:', { sessionId, userId, text: inputText })
        const userData = JSON.parse(localStorage.getItem('userData') || '{}')
        const userId = userData._id || userData.id || null
        console.log('User data:', userData)
        const response = await chatAPI.sendMessage(sessionId, userId, inputText)
        console.log('Backend response:', response)
        
        if (response.adminMessage) {
          const finalMessages = [...updatedMessages, response.adminMessage]
          setMessages(finalMessages)
          localStorage.setItem('chatMessages', JSON.stringify(finalMessages))
        }
      } else {
        // Fallback: Simulate admin response locally
        setTimeout(() => {
          const responses = [
            'I will check that for you.',
            'Thank you for your question. Let me assist you.',
            'That sounds interesting. Tell me more.',
            'I understand. Let me help you with that.',
            'Please provide more details so I can assist better.',
            'Our team will get back to you shortly.',
            'You can find more information on our products page.',
            'Is there anything else I can help you with?'
          ]

          const adminResponse = {
            id: updatedMessages.length + 1,
            text: responses[Math.floor(Math.random() * responses.length)],
            sender: 'admin',
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          }

          const finalMessages = [...updatedMessages, adminResponse]
          setMessages(finalMessages)
          localStorage.setItem('chatMessages', JSON.stringify(finalMessages))
        }, 1000)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Fallback to local simulation on error
      setTimeout(() => {
        const responses = [
          'I will check that for you.',
          'Thank you for your question. Let me assist you.',
          'That sounds interesting. Tell me more.',
          'I understand. Let me help you with that.',
          'Please provide more details so I can assist better.',
          'Our team will get back to you shortly.',
          'You can find more information on our products page.',
          'Is there anything else I can help you with?'
        ]

        const adminResponse = {
          id: updatedMessages.length + 1,
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: 'admin',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }

        const finalMessages = [...updatedMessages, adminResponse]
        setMessages(finalMessages)
        localStorage.setItem('chatMessages', JSON.stringify(finalMessages))
      }, 1000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage(e)
    }
  }

  return (
    <div className="chatbot-container">
      {/* Chatbot Button */}
      <button
        className={`chatbot-button ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <span className="chatbot-icon"><FaComment /></span>
        {!isOpen && messages.length > 1 && (
          <span className="chatbot-badge">
            {messages.filter(m => m.sender === 'admin').length > 0 ? 
              messages.filter(m => m.sender === 'admin').length : ''}
          </span>
        )}
      </button>

      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <span className="chatbot-avatar"><FaUser /></span>
            <div className="chatbot-header-text">
              <h4>Customer Support</h4>
              <p className="chatbot-status">
                {useBackend ? 'Online' : 'Available'}
              </p>
            </div>
          </div>
          <button
            className="chatbot-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <FaTimes />
          </button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chatbot-message ${message.sender}`}
            >
              <div className="chatbot-message-content">
                <p>{message.text}</p>
                <span className="chatbot-message-time">{message.time}</span>
              </div>
              {message.sender === 'admin' && (
                <span className="chatbot-message-avatar"><FaUser /></span>
              )}
              {message.sender === 'user' && (
                <span className="chatbot-message-avatar"><FaUser /></span>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="chatbot-message admin">
              <div className="chatbot-message-content">
                <p className="chatbot-typing">Typing...</p>
              </div>
              <span className="chatbot-message-avatar"><FaUser /></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="chatbot-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button type="submit" disabled={!inputText.trim() || isLoading}>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chatbot
