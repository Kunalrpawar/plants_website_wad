import React, { useState, useRef, useEffect } from 'react';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const PlantChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm your plant assistant. Ask me anything about plants!", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { text: input, sender: 'user' as 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call Gemini API - Updated to use Gemini 2.0 Flash
      const apiKey = process.env.REACT_APP_GOOGLE_API_KEY || 'AIzaSyBsXQ8UfQBVZgT53uy_djmqMLWZTh0DZ18';
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful plant assistant. Your job is to provide information about plants, gardening, and plant care. 
                     Only answer questions related to plants. If asked about anything else, politely redirect the conversation to plants.
                     
                     User query: ${input}`
            }]
          }]
        })
      });

      const data = await response.json();
      let botReply = "I'm sorry, I couldn't process your request. Please try again.";
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        botReply = data.candidates[0].content.parts[0].text;
      }

      // Add bot response
      setMessages(prev => [...prev, { text: botReply, sender: 'bot' }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: "Sorry, I'm having trouble connecting right now. Please try again later.", 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chatbot toggle button */}
      <button 
        className={`chatbot-toggle ${isOpen ? 'chatbot-open' : ''}`} 
        onClick={toggleChatbot}
        aria-label="Toggle chatbot"
      >
        <i className={isOpen ? "ri-close-line" : "ri-plant-line"}></i>
      </button>

      {/* Chatbot window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Plant Assistant</h3>
          </div>
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                {message.sender === 'bot' && <i className="ri-plant-line bot-icon"></i>}
                <div className="message-text">{message.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot-message">
                <i className="ri-plant-line bot-icon"></i>
                <div className="message-text typing">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="chatbot-input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about plants..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              <i className="ri-send-plane-line"></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PlantChatbot; 