import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const SecurityChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your security assistant. How may I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Azure OpenAI API configuration
  const token = import.meta.env.VITE_AZURE_OPENAI_KEY; // Ensure this is set in your environment
  const endpoint = "https://models.github.ai/inference";
  const model = "openai/gpt-4.1";

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message immediately
    const newMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Create a client for the Azure OpenAI service
      const client = ModelClient(endpoint, new AzureKeyCredential(token));

      // Prepare conversation history
      const conversationHistory = [
        { role: "system", content: "You are a security assistant for a healthcare organization. Provide helpful responses about cybersecurity, compliance (HIPAA), and IT security best practices." },
        ...messages.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: "user", content: inputMessage }
      ];

      // Call the API
      const response = await client.path("/chat/completions").post({
        body: {
          messages: conversationHistory,
          temperature: 0.7,
          top_p: 1,
          model: model
        }
      });

      if (isUnexpected(response)) {
        throw response.body.error;
      }

      const botResponse = response.body.choices[0].message.content;

      // Add bot response
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      }]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="
            bg-gradient-to-r from-purple-600 to-blue-600 
            text-white p-4 rounded-full shadow-lg 
            hover:shadow-xl transition-all
            hover:scale-105 focus:outline-none
          "
          aria-label="Open security chatbot"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      ) : (
        <div className="w-80 h-[32rem] bg-white rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="
            bg-gradient-to-r from-purple-600 to-blue-600 
            p-3 flex items-center justify-between
            text-white
          ">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-medium text-sm">Security Assistant</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded"
              aria-label="Close chatbot"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[90%] p-3 rounded-lg text-sm
                  ${message.type === 'user' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-800'}
                `}>
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a security question..."
                className="
                  flex-1 border border-gray-300 rounded-lg px-3 py-2
                  text-sm focus:outline-none focus:ring-2
                  focus:ring-purple-500 focus:border-transparent
                "
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="
                  bg-purple-600 text-white p-2 rounded-lg
                  hover:bg-purple-700 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityChatbot;
