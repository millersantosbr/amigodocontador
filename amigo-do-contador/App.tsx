
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage as ChatMessageType, SenderType } from './types';
import ChatMessageComponent from './components/ChatMessage';
import LoadingSpinner from './components/LoadingSpinner';
import IconSend from './components/IconSend';
import { sendMessageToGeminiStream, isApiKeySet, initializeGemini, getChatSession } from './services/geminiService';
import { API_KEY_MISSING_ERROR, INITIAL_GREETING_MESSAGE, FLASH_CARD_PROMPTS } from './constants';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyOk, setApiKeyOk] = useState<boolean>(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  const initializeApp = useCallback(async () => {
    if (!isApiKeySet()) {
      setError(API_KEY_MISSING_ERROR);
      setApiKeyOk(false);
      setMessages([{
        id: 'system-error-apikey',
        text: API_KEY_MISSING_ERROR,
        sender: SenderType.SYSTEM,
        timestamp: new Date(),
      }]);
      return;
    }
    
    try {
      initializeGemini(); 
      await getChatSession(); 
      setApiKeyOk(true);
      setError(null);
      setMessages([
        {
          id: 'initial-greeting',
          text: INITIAL_GREETING_MESSAGE,
          sender: SenderType.AI,
          timestamp: new Date(),
        },
      ]);
    } catch (e) {
      console.error("Initialization failed:", e);
      const errorMessage = e instanceof Error ? e.message : "Falha ao inicializar o assistente. Verifique sua chave de API e a conexão.";
      setError(errorMessage);
      setApiKeyOk(false);
      setMessages([{
        id: 'system-error-init',
        text: `Erro na inicialização: ${errorMessage}`,
        sender: SenderType.SYSTEM,
        timestamp: new Date(),
      }]);
    }
  }, []);

  useEffect(() => {
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializeApp]); 

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleSendMessage = async (eventOrQuery?: React.FormEvent<HTMLFormElement> | string) => {
    let queryText = '';

    if (eventOrQuery) {
      if (typeof eventOrQuery === 'string') {
        queryText = eventOrQuery; // Query comes from a flash card
      } else { // It's a FormEvent from the input field
        eventOrQuery.preventDefault();
        queryText = userInput.trim();
      }
    } else { // Fallback, should ideally not happen if called correctly
      queryText = userInput.trim();
    }

    if (!queryText || isLoading || !apiKeyOk) return;

    const newUserMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      text: queryText,
      sender: SenderType.USER,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    
    // Clear input only if the message came from the text input field, not a flash card
    if (typeof eventOrQuery !== 'string' || !eventOrQuery) {
        setUserInput('');
    }
    
    setIsLoading(true);
    setError(null);

    const aiMessageId = `ai-${Date.now()}`;
    setMessages(prev => [...prev, {
        id: aiMessageId,
        text: '',
        sender: SenderType.AI,
        timestamp: new Date(),
    }]);

    try {
      let fullAiResponse = '';
      const stream = sendMessageToGeminiStream(newUserMessage.text); // newUserMessage.text is queryText
      for await (const chunk of stream) {
        fullAiResponse += chunk;
        setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, text: fullAiResponse } : msg
        ));
      }
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId ? { ...msg, text: fullAiResponse } : msg
      ));

    } catch (err) {
      console.error("Error getting response from AI:", err);
      const errorText = err instanceof Error ? err.message : 'Ocorreu um erro ao processar sua solicitação.';
      setError(errorText);
      setMessages(prev => prev.filter(msg => msg.id !== aiMessageId)); 
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        text: `Erro: ${errorText}`,
        sender: SenderType.SYSTEM,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInstallPrompt = () => {
    alert("Para instalar este app, procure a opção 'Adicionar à tela inicial' ou 'Instalar aplicativo' no menu do seu navegador.");
  };

  // Show flash cards only if API key is OK and only the initial greeting message is present
  const showFlashCards = apiKeyOk && messages.length === 1 && messages[0]?.id === 'initial-greeting';

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden antialiased">
      <header className="bg-slate-800 shadow-lg p-4 sm:p-6 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Amigo do Contador IA
        </h1>
        <button
          onClick={handleInstallPrompt}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm transition duration-150 ease-in-out"
          aria-label="Instalar Aplicativo"
        >
          Instalar App
        </button>
      </header>

      {!apiKeyOk && error && messages.some(m => m.sender === SenderType.SYSTEM && m.id.includes('apikey')) && (
        <div className="p-4 bg-red-700 text-white text-center font-semibold">
          {error}
        </div>
      )}
      
      <main ref={chatAreaRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 chat-area bg-slate-900">
        {messages.map((msg) => (
          <ChatMessageComponent key={msg.id} message={msg} />
        ))}

        {showFlashCards && (
          <div className="my-4 px-2">
            <p className="text-sm text-slate-400 mb-3 text-center">Ou comece com uma destas sugestões:</p>
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
              {FLASH_CARD_PROMPTS.map(prompt => (
                <button
                  key={prompt.id}
                  onClick={() => handleSendMessage(prompt.query)}
                  className="bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-medium py-2 px-3 rounded-lg shadow-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75"
                  aria-label={`Sugestão: ${prompt.text}`}
                >
                  {prompt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && messages[messages.length -1]?.sender === SenderType.AI && messages[messages.length -1]?.text === '' && (
           <div className="flex justify-start mb-4">
             <div className="max-w-lg lg:max-w-xl px-4 py-3 shadow-md bg-slate-700 text-slate-100 self-start rounded-r-xl rounded-tl-xl" aria-live="polite">
                <LoadingSpinner />
                <span className="sr-only">Carregando resposta do assistente</span>
             </div>
           </div>
        )}
      </main>

      <footer className="bg-slate-800 p-3 sm:p-4 shadow-up">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2 sm:space-x-3">
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder={apiKeyOk ? "Digite sua dúvida contábil..." : "Aguardando configuração da API..."}
            className="flex-1 p-3 sm:p-4 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-slate-700 text-slate-100 placeholder-slate-400 transition duration-150 ease-in-out"
            disabled={isLoading || !apiKeyOk}
            aria-label="Campo de entrada para sua dúvida contábil"
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim() || !apiKeyOk}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 sm:p-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out flex items-center justify-center"
            aria-label={isLoading ? "Enviando mensagem" : "Enviar mensagem"}
          >
            {isLoading ? <LoadingSpinner /> : <IconSend className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </form>
      </footer>
    </div>
  );
};

export default App;
