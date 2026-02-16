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
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const uid = () => Math.random().toString(36).slice(2, 15);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: uid(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMsg.content },
          ],
          stream: false,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
      }

      const data = await res.json();
      const content = data.choices[0]?.message?.content || 'No response';

      setMessages((m) => [...m, {
        id: uid(),
        role: 'assistant',
        content,
        timestamp: new Date(),
      }]);
    } catch (err) {
      console.error('Failed to send:', err);
      setMessages((m) => [...m, {
        id: uid(),
        role: 'assistant',
        content: err instanceof Error ? `Error: ${err.message}` : 'Something went wrong',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="app">
      <Navbar className="nav">
        <NavbarGroup align={Alignment.LEFT}>
          <Icon icon="chat" className="nav-icon" />
          <NavbarHeading>Chat</NavbarHeading>
        </NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>
          <Tag minimal className="tag">{MODEL}</Tag>
          {messages.length > 0 && (
            <Button icon="trash" minimal onClick={() => setMessages([])} text="Clear" />
          )}
        </NavbarGroup>
      </Navbar>

      <div className="messages">
        {messages.length === 0 ? (
          <NonIdealState
            icon="chat"
            title="Start chatting"
            description="Type a message below to begin."
          />
        ) : (
          <div className="message-list">
            {messages.map((m) => (
              <Card key={m.id} className={`bubble ${m.role}`} elevation={1}>
                <div className="header">
                  <H6 className="author">
                    <Icon icon={m.role === 'user' ? 'user' : 'predictive-analysis'} />
                    {m.role === 'user' ? 'You' : 'Assistant'}
                  </H6>
                  <span className="time">{m.timestamp.toLocaleTimeString()}</span>
                </div>
                <div className="content">
                  {m.content.split('\n').map((line, i) => (
                    <p key={i}>{line || '\u00A0'}</p>
                  ))}
                </div>
              </Card>
            ))}
            {loading && (
              <Card className="bubble assistant loading" elevation={1}>
                <Spinner size={20} />
              </Card>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="composer">
        <div className="input-row">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message..."
            className="input"
            disabled={loading}
            fill
          />
          <Button
            icon={loading ? 'refresh' : 'send-message'}
            intent="primary"
            onClick={send}
            disabled={!input.trim() || loading}
            loading={loading}
            className="send"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;