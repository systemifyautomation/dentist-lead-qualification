import { useState, useEffect, useRef } from 'react';
import type { Message } from '../types';
import './Chatbot.css';

interface ChatbotProps {
  onClose: () => void;
}

const Chatbot = ({ onClose }: ChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour! Je suis DENTIRO, l\'assistante IA réceptionniste. Je suis disponible pour vous aider avec la prise de rendez-vous, vos questions dentaires, ou vos préoccupations. Comment puis-je vous aider?',
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageToWebhook = async (userMessage: string): Promise<{ conversation_id: string; response: string }> => {
    try {
      const response = await fetch(import.meta.env.VITE_WEBHOOK_CHATBOT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversation_id: conversationId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();
      return {
        conversation_id: data.conversation_id,
        response: data.response
      };
    } catch (error) {
      console.error('Chatbot webhook error:', error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      const webhookResponse = await sendMessageToWebhook(messageText);
      
      // Update conversation ID if returned
      if (webhookResponse.conversation_id) {
        setConversationId(webhookResponse.conversation_id);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: webhookResponse.response,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // Fallback error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '😔 Désolé, je rencontre un problème technique. Veuillez réessayer ou remplir le formulaire de contact ci-dessus pour qu\'un membre de notre équipe vous contacte.',
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="chatbot-header-content">
          <svg className="chatbot-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 12h8M8 16h5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="9" r="1" fill="currentColor"/>
          </svg>
          <h3>Réceptionniste IA DENTIRO</h3>
        </div>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>

      <div className="chatbot-messages">
        {showSecurity && (
          <div className="message bot-message security-message">
            <div className="message-content">🔒 Sécurité: Ce chatbot est alimenté par une IA approuvée conforme à la RGPD. Vos données personnelles ne seront pas stockées sans consentement. Les conversations restent confidentielles.</div>
          </div>
        )}
        
        {!showSecurity && (
          <button className="security-toggle-button" onClick={() => setShowSecurity(true)}>
            🔒 Préoccupé par la sécurité de vos données?
          </button>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-content">{message.text}</div>
          </div>
        ))}
        {isTyping && (
          <div className="message bot-message">
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Écrivez votre message..."
        />
        <button onClick={handleSend} disabled={!inputValue.trim()}>
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
