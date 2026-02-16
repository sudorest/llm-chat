import { useState, useRef, useEffect } from 'react';
import {
  Card,
  Button,
  TextArea,
  NonIdealState,
  Spinner,
  H6,
  Tag,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Alignment,
  Icon,
} from '@blueprintjs/core';
import './App.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const API_URL = 'https://llmrouter.k8s.mreow.de/v1/chat/completions';
const API_KEY = 'meowmeomwo';
const MODEL = 'gpt-4o';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            ...messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            {
              role: 'user',
              content: userMessage.content,
            },
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      const assistantContent = data.choices[0]?.message?.content || 'No response';

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      let errorContent = 'Sorry, there was an error processing your request.';
      
      if (error instanceof Error) {
        errorContent += ` Error: ${error.message}`;
      }
      
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="app-container">
      <Navbar className="chat-navbar">
        <NavbarGroup align={Alignment.LEFT}>
          <Icon icon="chat" className="navbar-icon" />
          <NavbarHeading>LLM Chat</NavbarHeading>
        </NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>
          <Tag minimal className="model-tag">{MODEL}</Tag>
          {messages.length > 0 && (
            <Button
              icon="trash"
              minimal
              onClick={clearChat}
              text="Clear"
            />
          )}
        </NavbarGroup>
      </Navbar>

      <div className="chat-container">
        {messages.length === 0 ? (
          <NonIdealState
            icon="chat"
            title="Start a conversation"
            description="Type a message below to begin chatting with the AI assistant."
          />
        ) : (
          <div className="messages-container">
            {messages.map((message) => (
              <Card
                key={message.id}
                className={`message-card ${message.role}`}
                elevation={1}
              >
                <div className="message-header">
                  <H6 className="message-role">
                    <Icon
                      icon={message.role === 'user' ? 'user' : 'predictive-analysis'}
                      className="role-icon"
                    />
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </H6>
                  <span className="message-timestamp">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-content">
                  {message.content.split('\n').map((line, index) => (
                    <p key={index}>{line || '\u00A0'}</p>
                  ))}
                </div>
              </Card>
            ))}
            {isLoading && (
              <Card className="message-card assistant loading" elevation={1}>
                <Spinner size={20} />
              </Card>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <TextArea
            inputRef={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            className="chat-input"
            disabled={isLoading}
            fill
          />
          <Button
            icon={isLoading ? 'refresh' : 'send-message'}
            intent="primary"
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            loading={isLoading}
            className="send-button"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;