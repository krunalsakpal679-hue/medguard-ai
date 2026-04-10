import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import { config } from '../utils/environment'
import { useAuthStore } from '../store/authStore'

const API_BASE = config.apiUrl

export const useChat = () => {
    const { token } = useAuthStore()
    const [messages, setMessages] = useState([])
    const [conversationId, setConversationId] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [selectedLanguage, setSelectedLanguage] = useState('en')
    const [conversations, setConversations] = useState([])

    /**
     * Detects script and updates language state before sending clinical query.
     */
    const detectLanguageHeuristic = (text) => {
        if (/[\u0900-\u097F]/.test(text)) return 'hi'
        if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'
        return 'en'
    }

    const fetchConversations = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE}/chat/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setConversations(res.data)
        } catch (err) {
            console.error("Failed to load clinical chat history", err)
        }
    }, [token])

    const loadConversation = async (id) => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await axios.get(`${API_BASE}/chat/conversations/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setMessages(res.data)
            setConversationId(id)
        } catch (err) {
            setError("Could not retrieve medical dialogue history.")
        } finally {
            setIsLoading(false)
        }
    }

    const sendMessage = async (text) => {
        if (!text.trim()) return
        
        const lang = detectLanguageHeuristic(text)
        setSelectedLanguage(lang)
        
        // 1. Optimistic UI: Add user message immediately
        const userMsg = { role: 'user', content: text, language: lang, timestamp: new Date(), isBot: false, text: text }
        setMessages(prev => [...prev, userMsg])
        setIsLoading(true)
        setError(null)

        try {
            const res = await axios.post(`${API_BASE}/chat/message`, {
                message: text,
                language: lang,
                conversation_id: conversationId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            // 2. State-sync: Update conversation context
            if (!conversationId) {
                setConversationId(res.data.conversation_id)
                fetchConversations()
            }

            // 3. Add AI Response with clinical drug identifiers
            const aiMsg = {
                role: 'assistant',
                content: res.data.response,
                language: res.data.language,
                detected_drugs: res.data.detected_drugs,
                timestamp: new Date(),
                isBot: true,
                text: res.data.response
            }
            setMessages(prev => [...prev, aiMsg])
        } catch (err) {
            setError("Medical gateway timeout. Please retry your clinical query.")
            setMessages(prev => prev.slice(0, -1)) // Rollback optimistic update
        } finally {
            setIsLoading(false)
        }
    }

    const startNewConversation = () => {
        setMessages([])
        setConversationId(null)
        setError(null)
    }

    const deleteConversation = async (id) => {
        try {
            await axios.delete(`${API_BASE}/chat/conversations/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (conversationId === id) startNewConversation()
            fetchConversations()
        } catch (err) {
            console.error("Failed to purge clinical record", err)
        }
    }

    useEffect(() => {
        if (token) fetchConversations()
    }, [token, fetchConversations])

    return {
        messages,
        conversationId,
        conversations,
        isLoading,
        error,
        selectedLanguage,
        sendMessage,
        loadConversation,
        startNewConversation,
        deleteConversation,
        setSelectedLanguage
    }
}
