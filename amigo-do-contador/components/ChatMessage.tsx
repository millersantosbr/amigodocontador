
import React from 'react';
import { ChatMessage as ChatMessageType, SenderType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === SenderType.USER;
  const isAI = message.sender === SenderType.AI;
  const isSystem = message.sender === SenderType.SYSTEM;

  const bubbleClasses = isUser
    ? 'bg-blue-600 text-white self-end rounded-l-xl rounded-tr-xl'
    : isAI
    ? 'bg-slate-700 text-slate-100 self-start rounded-r-xl rounded-tl-xl'
    : 'bg-yellow-500 text-black self-center rounded-xl text-sm';
  
  const containerClasses = `flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`;

  // Basic markdown-like formatting for AI responses
  const formatText = (text: string): React.ReactNode => {
    if (!isAI) return text;

    // Replace **text** with <strong>text</strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Replace *text* or _text_ with <em>text</em>
    text = text.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
    // Replace `text` with <code>text</code>
    text = text.replace(/`(.*?)`/g, '<code class="bg-slate-800 px-1 rounded text-sm">$1</code>');
    // Replace lists (- item or * item)
    text = text.replace(/^\s*([-*])\s+(.*)/gm, (match, _, item) => `<li>${item}</li>`);
    text = text.replace(/(<li>.*<\/li>)+/gs, (match) => `<ul class="list-disc list-inside pl-4">${match}</ul>`);
    // Replace newlines with <br />
    text = text.replace(/\n/g, '<br />');

    return <div dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return (
    <div className={containerClasses}>
      <div className={`max-w-lg lg:max-w-xl px-4 py-3 shadow-md ${bubbleClasses}`}>
        <p className="text-sm whitespace-pre-wrap">{formatText(message.text)}</p>
        {/* <span className="text-xs text-gray-400 mt-1 block">
          {message.timestamp.toLocaleTimeString()}
        </span> */}
      </div>
    </div>
  );
};

export default ChatMessage;
