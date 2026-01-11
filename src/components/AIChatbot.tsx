import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI healthcare assistant. How can I help you today? You can ask me about general health information, symptoms, or how to use DocNear.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<any>(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Initialize chat session
  const initializeChat = () => {
    if (!apiKey || chatRef.current) return;
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const systemInstruction = `You are a helpful AI healthcare assistant for DocNear, a doctor appointment booking platform. 
Provide general health information and guidance, but always remind users that you are not a substitute for professional medical advice.
Be friendly, concise, and helpful. You can answer questions about:
- General health and wellness
- How to use DocNear features
- When to see a doctor
- General health tips

Always recommend consulting with a healthcare professional for serious concerns. Keep responses concise and easy to understand.`;

      chatRef.current = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
        systemInstruction,
      });
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'API key is not configured. Please contact support.',
        },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      // Initialize chat if not already done
      if (!chatRef.current) {
        initializeChat();
      }

      if (!chatRef.current) {
        throw new Error('Failed to initialize chat');
      }

      const result = await chatRef.current.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { role: 'assistant', content: text }]);
    } catch (error: any) {
      console.error('Error calling Gemini API:', error);
      let errorMessage = 'Sorry, I encountered an error. Please try again later.';
      
      if (error.message?.includes('API_KEY_INVALID')) {
        errorMessage = 'API key is invalid. Please check your configuration.';
      } else if (error.message?.includes('QUOTA')) {
        errorMessage = 'API quota exceeded. Please try again later.';
      }
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group animate-float hover:animate-none relative"
          aria-label="Open AI Chatbot"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 animate-bounce" style={{ animationDuration: '2s' }} />
              <h3 className="font-semibold text-lg">AI Health Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 rounded-full p-1 transition-all duration-200 hover:rotate-90"
              aria-label="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-slide`}
                style={{
                  animationDelay: `${Math.min(index * 0.03, 0.3)}s`,
                }}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm transition-all duration-200 hover:shadow-md ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && (
                      <Bot className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    )}
                    {message.role === 'user' && (
                      <User className="w-4 h-4 mt-0.5 text-white flex-shrink-0" />
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in-slide">
                <div className="bg-white text-gray-800 border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-blue-500 animate-pulse" />
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:scale-110 active:scale-95 disabled:hover:scale-100"
                aria-label="Send Message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};
