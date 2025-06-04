import React, { useState, useEffect, useRef } from 'react';

// TypeScript interfaces
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface ChatbotProps {
  apiKey?: string;
  model?: string;
  autoStart?: boolean;
  theme?: 'default' | 'dark';
  position?: 'bottom-right' | 'bottom-left';
}

const AIChatbot: React.FC<ChatbotProps> = ({
  apiKey = process.env.REACT_APP_API_KEY,
  model = 'deepseek/deepseek-r1-distill-llama-70b:free',
  autoStart = true,
  theme = 'default',
  position = 'bottom-right'
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-start functionality
  useEffect(() => {
    if (autoStart && messages.length === 0) {
      const timer = setTimeout(() => {
        sendMessage();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart]);

  const sendMessage = async (): Promise<void> => {
    const userMessage: Message = {
      role: 'user',
      content: `You're a witty and knowledgeable cybersecurity educator for South African hospital workers. Based on recent South African cybersecurity news and OWASP Top 10, give a short, fun, and scientifically accurate cybersecurity tip for today. The tone should be light and engaging, but informative — something that could appear on a hospital intranet screen. Use one OWASP Top 10 risk at a time and cycle through them. Include a reference to a recent South African cybersecurity breach or trend if relevant. Limit answers to 100 words. Don't use city names. TIPS MUST BE USEFUL TO HOSPITAL WORKERS CYBERSECURITY and practical.`,
      timestamp: new Date()
    };

    setIsLoading(true);
    setError(null);

    // Add user message to history for API call
    const messageHistory = [...messages, userMessage];

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: messageHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const modelReply = data.choices?.[0]?.message?.content || 'No reply received.';

      const assistantMessage: Message = {
        role: 'assistant',
        content: modelReply,
        timestamp: new Date()
      };

      // Update messages with both user and assistant messages
      setMessages(prev => [...prev, userMessage, assistantMessage]);

    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch response');
      
      // Still add user message to show what was attempted
      setMessages(prev => [...prev, userMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = (): void => {
    setIsOpen(!isOpen);
  };

  const closeChat = (): void => {
    setIsOpen(false);
  };

  // Position classes
  const positionClasses = position === 'bottom-right' 
    ? 'bottom-4 right-5' 
    : 'bottom-4 left-5';

  // Theme classes
  const themeClasses = theme === 'dark' 
    ? 'bg-gray-800 text-white' 
    : 'bg-white text-gray-900';

  // Loader component
  const Loader: React.FC = () => (
    <div className="flex justify-center items-center py-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );

  return (
    <>
      {/* Chat Button */}
      <div 
        className={`fixed ${positionClasses} z-50 bg-purple-600 text-yellow-100 h-16 w-16 md:h-20 md:w-20 rounded-full flex justify-center items-center cursor-pointer hover:shadow-lg hover:bg-purple-700 transition-all duration-300 ${isOpen ? 'hidden' : 'flex'}`}
        onClick={toggleChat}
        role="button"
        aria-label="Open chat"
      >
        <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04 1.05 4.4L1 23l6.6-2.05C9.96 21.64 11.46 22 13 22h-.5c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.4 0-2.76-.3-4-.85L3 20l.85-5C3.3 13.76 3 12.4 3 11c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9z"/>
          <circle cx="9" cy="12" r="1"/>
          <circle cx="12" cy="12" r="1"/>
          <circle cx="15" cy="12" r="1"/>
        </svg>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed ${positionClasses} z-50 ${themeClasses} rounded-3xl shadow-2xl h-[500px] md:h-[600px] w-[320px] md:w-[360px] flex flex-col border border-gray-200`}>
          {/* Header */}
          <div className="bg-purple-600 text-yellow-100 py-3 px-4 rounded-t-3xl flex justify-between items-center">
            <h3 className="font-semibold text-sm md:text-base">🏥 Cybersecurity Assistant</h3>
            <button 
              onClick={closeChat}
              className="text-xl font-bold hover:bg-purple-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Chat Area */}
          <div 
            ref={chatContainerRef}
            className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50"
          >
            {/* Initial greeting */}
            {messages.length === 0 && !isLoading && (
              <div className="flex justify-start">
                <div className="bg-blue-200 rounded-2xl max-w-[85%] p-3 text-sm md:text-base">
                  👩🏻‍⚕️ Hi! I'm here to keep you safe with cybersecurity tips for hospital workers.
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-2xl max-w-[85%] p-3 text-sm md:text-base ${
                  message.role === 'user' 
                    ? 'bg-purple-600 text-yellow-100' 
                    : 'bg-blue-200 text-gray-800'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-blue-200 rounded-2xl max-w-[85%] p-3">
                  <Loader />
                </div>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="flex justify-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl text-sm">
                  Error: {error}
                  <button 
                    onClick={sendMessage}
                    className="ml-2 underline hover:no-underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Area */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={sendMessage}
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base font-medium"
            >
              {isLoading ? 'Getting tip...' : 'Get New Cybersecurity Tip'}
            </button>
          </div>

          {/* Footer */}
          <div className="bg-purple-600 text-purple-600 py-1 rounded-b-3xl text-center">
            .
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;