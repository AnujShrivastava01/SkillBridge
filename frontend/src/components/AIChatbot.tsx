import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  files?: string[];
}

const AIChatbot: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalVisible, setModalVisible] = useState(false);

  React.useEffect(() => {
    if (open) {
      setModalVisible(true);
    } else {
      const timeout = setTimeout(() => setModalVisible(false), 180);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  if (!user) return null;

  const handleSend = async () => {
    if (!input && files.length === 0) return;
    setMessages((msgs) => [...msgs, { sender: 'user', text: input, files: files.map(f => f.name) }]);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('prompt', input);
      files.forEach((file) => formData.append('files', file));
      const token = localStorage.getItem('authToken');
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/ai-chatbot`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMessages((msgs) => [
        ...msgs,
        { sender: 'ai', text: res.data.aiResponse || 'No response from AI.' },
      ]);
      setInput('');
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { sender: 'ai', text: 'Error: Could not get a response from AI Chatbot.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <>
      {/* Floating Chatbot Icon */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'fixed',
          bottom: 40,
          right: 40,
          zIndex: 1000,
          background: '#fff',
          border: '2px solid #1e293b',
          borderRadius: 0,
          width: 40,
          height: 40,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          cursor: 'pointer',
          fontFamily: 'Segoe UI, Arial, sans-serif',
        }}
        aria-label="Open SkillBridge MentorBot"
      >
        <span role="img" aria-label="AI Chatbot">🤖</span>
      </button>
      {/* Chatbot Modal */}
      {modalVisible && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: open
              ? 'translate(-50%, -50%) scale(1)'
              : 'translate(-50%, -50%) scale(0.96)',
            opacity: open ? 1 : 0,
            width: 'min(540px, 98vw)',
            height: 'min(500px, 98vh)',
            background: '#f8fafc',
            borderRadius: 0,
            boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '2px solid #1e293b',
            fontFamily: 'Segoe UI, Arial, sans-serif',
            transition: 'opacity 0.18s, transform 0.18s',
          }}
        >
          {/* Header */}
          <div style={{
            background: '#1e293b',
            color: '#fff',
            padding: '12px 18px',
            fontWeight: 700,
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #334155',
            letterSpacing: 1.1,
            flexDirection: 'column',
            gap: 2,
          }}>
            <span style={{display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'space-between'}}>
              <span style={{display: 'flex', alignItems: 'center', gap: 10}}>
                <span role="img" aria-label="AI Chatbot" style={{fontSize: 18}}>🤖</span>
                <span style={{fontWeight: 800, fontSize: 20, color: '#fff'}}>SkillBridge MentorBot</span>
              </span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', fontWeight: 400 }}>×</button>
            </span>
            <span style={{fontSize: 12, color: '#cbd5e1', fontWeight: 500, marginTop: 2, letterSpacing: 0.2}}>
              Your AI Mentor for College & Career Success
            </span>
          </div>
          {/* Chat Area */}
          <div style={{ flex: 1, padding: 14, overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '2px solid #e2e8f0' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left', margin: '4px 0' }}>
                <span style={{
                  display: 'inline-block',
                  background: msg.sender === 'user' ? '#2563eb' : '#f1f5f9',
                  color: msg.sender === 'user' ? '#fff' : '#222',
                  borderRadius: 0,
                  padding: '8px 14px',
                  maxWidth: '80vw',
                  wordBreak: 'break-word',
                  fontSize: 14,
                  border: msg.sender === 'user' ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1',
                  fontFamily: 'Segoe UI, Arial, sans-serif',
                }}>{msg.text}</span>
                {msg.files && msg.files.length > 0 && (
                  <div style={{ fontSize: 11, color: '#555', marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    <b>Files:</b> {msg.files.map((f, i) => (
                      <span key={i} style={{ background: '#e0e7ff', borderRadius: 0, padding: '2px 8px', marginLeft: 4 }}>{f}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <div style={{ textAlign: 'center', color: '#64748b', fontSize: 14, opacity: 0.7, fontStyle: 'italic', letterSpacing: 1 }}>AI Chatbot is typing...</div>}
          </div>
          {/* Input Area */}
          <div style={{ padding: 10, borderTop: '2px solid #e2e8f0', background: '#fff', display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              style={{ flex: 1, borderRadius: 0, border: '1.5px solid #cbd5e1', padding: '8px 12px', fontSize: 14, background: '#f8fafc', outline: 'none', color: '#333', fontFamily: 'Segoe UI, Arial, sans-serif', transition: 'box-shadow 0.2s' }}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              disabled={loading}
            />
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                borderRadius: 0,
                border: '1.5px solid #cbd5e1',
                background: '#f1f5f9',
                padding: '0 8px',
                fontSize: 16,
                color: '#2563eb',
                cursor: 'pointer',
                fontWeight: 700,
                height: 32,
                fontFamily: 'Segoe UI, Arial, sans-serif',
              }}
              disabled={loading}
              title="Attach files"
            >📎</button>
            <button
              onClick={handleSend}
              style={{
                borderRadius: 0,
                border: 'none',
                background: '#2563eb',
                color: '#fff',
                padding: '0 14px',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
                height: 32,
                letterSpacing: 1.1,
                fontFamily: 'Segoe UI, Arial, sans-serif',
              }}
              disabled={loading}
            >Send</button>
          </div>
          {files.length > 0 && (
            <div style={{ margin: '0 0 6px 0', fontSize: 11, color: '#555', paddingLeft: 14, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              <b>Files:</b> {files.map((f, i) => (
                <span key={i} style={{ background: '#e0e7ff', borderRadius: 0, padding: '2px 8px', marginLeft: 4 }}>{f.name}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AIChatbot; 