import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, ChatMessage, UserRole } from '../types';
import { SendIcon, SparklesIcon } from '../components/ui/Icons';
import { chat, auth, clients } from '../services/apiService';
import { getAIAssistantResponse } from '../services/geminiService';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_BASE_URL.replace('/api', ''); // Base URL for socket.io

interface ChatPageProps {
  currentUser: User;
  selectedClient?: User; // Only relevant for TRAINER role
}

const ChatPage: React.FC<ChatPageProps> = ({ currentUser, selectedClient }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChatPartner, setActiveChatPartner] = useState<User | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [loadingChat, setLoadingChat] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const fetchChatHistory = useCallback(async (partnerId: string) => {
    setLoadingChat(true);
    setError(null);
    try {
      const response = await chat.getMessages(partnerId);
      setMessages(response.data.data);
    } catch (err: any) {
      console.error('Error fetching chat history:', err);
      setError(err.response?.data?.message || 'Error al cargar el historial de chat.');
    } finally {
      setLoadingChat(false);
    }
  }, []);

  useEffect(() => {
    let partner: User | null = null;
    if (currentUser.role === UserRole.USER) {
      // For a user, the partner is their trainer. Fetch trainer info.
      const fetchTrainer = async () => {
        try {
          const res = await auth.getMe(); // Assuming getMe returns user with trainerId
          if (res.data.data.trainerId) {
            const trainerRes = await clients.getClientById(res.data.data.trainerId); // Assuming this endpoint can fetch trainers too
            partner = trainerRes.data.data;
            setActiveChatPartner(partner);
            if (partner?.id) {
              fetchChatHistory(partner.id);
            }
          } else {
            setError('No tienes un entrenador asignado.');
            setLoadingChat(false);
          }
        } catch (err) {
          console.error('Error fetching trainer for user:', err);
          setError('Error al obtener información del entrenador.');
          setLoadingChat(false);
        }
      };
      fetchTrainer();
    } else if (currentUser.role === UserRole.TRAINER && selectedClient) {
      partner = selectedClient;
      setActiveChatPartner(partner);
      fetchChatHistory(partner.id);
    } else if (currentUser.role === UserRole.TRAINER && !selectedClient) {
      setLoadingChat(false);
      setError('Selecciona un cliente para empezar a chatear.');
    }

    // Setup WebSocket connection
    const token = localStorage.getItem('token');
    if (token && partner) {
      socketRef.current = io(SOCKET_URL, {
        auth: { token },
        query: { userId: currentUser.id, partnerId: partner.id },
      });

      socketRef.current.on('connect', () => {
        console.log('Socket connected:', socketRef.current?.id);
      });

      socketRef.current.on('message', (message: ChatMessage) => {
        console.log('Received message:', message);
        setMessages(prev => [...prev, message]);
      });

      socketRef.current.on('error', (err: any) => {
        console.error('Socket error:', err);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUser, selectedClient, fetchChatHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChatPartner) return;

    const messageData = {
      sender: currentUser.id,
      receiver: activeChatPartner.id,
      text: newMessage,
    };
    
    try {
      // Send via REST API
      const response = await chat.sendMessage(activeChatPartner.id, messageData);
      const sentMessage = response.data.data; // Assuming backend returns the saved message
      
      // Emit via WebSocket for real-time update to other connected clients
      if (socketRef.current) {
        socketRef.current.emit('sendMessage', sentMessage);
      }

      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Error al enviar el mensaje.');
    }
  };

  const handleAIAssist = async () => {
    if (!newMessage.trim()) return;
    setIsLoadingAI(true);
    const userQuestion = newMessage;
    setNewMessage('');
    
    // Optimistically add user's question
    const questionMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: 'AI',
      text: userQuestion,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, questionMessage]);

    const aiResponse = await getAIAssistantResponse(userQuestion);
    
    const responseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: 'AI',
        receiverId: currentUser.id,
        text: aiResponse,
        timestamp: new Date().toISOString(),
        isAIMessage: true,
    };
    setMessages(prev => [...prev, responseMessage]);
    setIsLoadingAI(false);
  };

  if (loadingChat) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Cargando chat...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white rounded-xl shadow-lg">
      <header className="p-4 border-b border-base-200">
        <h1 className="text-xl font-bold text-gray-800">Chat</h1>
        {activeChatPartner ? (
          <p className="text-sm text-text-muted">Conversación con <span className="text-primary font-semibold">{activeChatPartner.name}</span></p>
        ) : (
          <p className="text-sm text-text-muted">
            {currentUser.role === UserRole.TRAINER ? "Selecciona un cliente para empezar a chatear." : "Pregúntale a tu entrenador."}
          </p>
        )}
      </header>

      <div className="flex-1 p-6 overflow-y-auto bg-base-100">
        <div className="space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex items-end gap-3 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
               {msg.senderId !== currentUser.id && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                  {msg.isAIMessage ? 'AI' : activeChatPartner?.name.charAt(0)}
                </div>
              )}
              <div
                className={`max-w-md p-3 rounded-xl ${
                  msg.senderId === currentUser.id
                    ? 'bg-primary text-white rounded-br-none'
                    : msg.isAIMessage 
                    ? 'bg-amber-100 text-amber-800 rounded-bl-none'
                    : 'bg-base-200 text-text-base rounded-bl-none'
                }`}
              >
                <p>{msg.text}</p>
                 <p className={`text-xs mt-1 ${msg.senderId === currentUser.id ? 'text-gray-200' : 'text-text-muted'} `}>{new Date(msg.timestamp).toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</p>
              </div>
            </div>
          ))}
           {isLoadingAI && (
                <div className="flex items-end gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">AI</div>
                    <div className="p-3 bg-amber-100 rounded-xl rounded-bl-none">
                        <div className="flex space-x-1">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                </div>
            )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <footer className="p-4 border-t border-base-200">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
            placeholder={activeChatPartner ? `Escribe a ${activeChatPartner.name}...` : 'Escribe tu mensaje...'}
            className="flex-1 p-3 border border-base-300 rounded-lg focus:ring-2 focus:ring-primary"
            disabled={!activeChatPartner && currentUser.role === UserRole.TRAINER}
          />
           {currentUser.role === UserRole.USER && (
            <button
              onClick={handleAIAssist}
              title="Obtener ayuda de la IA"
              className="p-3 rounded-lg bg-amber-400 text-white hover:bg-amber-500 disabled:bg-base-300"
              disabled={isLoadingAI || !newMessage}
            >
              <SparklesIcon className="w-6 h-6" />
            </button>
          )}
          <button
            onClick={handleSendMessage}
            className="p-3 rounded-lg bg-primary text-white hover:bg-primary-focus disabled:bg-base-300"
            disabled={!newMessage.trim() || !activeChatPartner}
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatPage;

