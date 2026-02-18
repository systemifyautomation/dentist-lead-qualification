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
      text: 'Hello! I\'m here to help you with any questions about our premium dental lead qualification system. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const botResponses: { [key: string]: string } = {
    pricing: 'Our pricing ranges from $500/month for the Starter plan to $5,000+/month for Enterprise. Each tier offers increasing features and support levels.',
    features: 'Our platform includes automated lead qualification, intelligent chatbot support, comprehensive admin dashboard, real-time analytics, and integration with major CRM systems.',
    support: 'We offer 24/7 premium support for all our clients, including dedicated account managers for Enterprise plans and priority response times.',
    timeline: 'Implementation typically takes 2-4 weeks depending on your practice size and integration requirements. We handle everything from setup to training.',
    integration: 'We integrate seamlessly with most major dental practice management software including Dentrix, Eaglesoft, Open Dental, and more.',
    default: 'That\'s a great question! Our team would be happy to provide detailed information. Please complete the application form, and one of our specialists will contact you within 24 hours.'
  };

  const getBotResponse = (userMessage: string): string => {
    const lowercaseMessage = userMessage.toLowerCase();
    
    if (lowercaseMessage.includes('price') || lowercaseMessage.includes('cost') || lowercaseMessage.includes('pricing')) {
      return botResponses.pricing;
    } else if (lowercaseMessage.includes('feature') || lowercaseMessage.includes('what do') || lowercaseMessage.includes('capabilities')) {
      return botResponses.features;
    } else if (lowercaseMessage.includes('support') || lowercaseMessage.includes('help')) {
      return botResponses.support;
    } else if (lowercaseMessage.includes('time') || lowercaseMessage.includes('how long') || lowercaseMessage.includes('implementation')) {
      return botResponses.timeline;
    } else if (lowercaseMessage.includes('integrate') || lowercaseMessage.includes('compatible') || lowercaseMessage.includes('software')) {
      return botResponses.integration;
    }
    
    return botResponses.default;
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
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
        <h3>Premium Support Assistant</h3>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>

      <div className="chatbot-messages">
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
          placeholder="Type your message..."
        />
        <button onClick={handleSend} disabled={!inputValue.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
