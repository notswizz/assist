import { useState, useRef, useEffect } from 'react';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

export default function Chatbot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isResponding, setIsResponding] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (message) => {
    if (message.trim() === '') return;

    setIsResponding(true);

    const userMessage = { role: "user", content: message };
    setMessages(prevMessages => [...prevMessages, { text: message, isUser: true }]);
    setInput('');

    try {
      // Prepare the conversation history for the API request
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.text
      }));

      // Add the current user message to the conversation history
      const validMessages = [...conversationHistory, userMessage];

      console.log('Sending messages for analysis:', validMessages);

      // Send the message to the AI for analysis
      const analysisResponse = await fetch('/api/analyzeMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze message');
      }

      const analysisData = await analysisResponse.json();
      console.log('Analysis result:', analysisData);

      // If the AI determines it's a to-do item, log it to the database
      if (analysisData.isTodo) {
        const logResponse = await fetch('/api/logTodo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        });

        if (!logResponse.ok) {
          throw new Error('Failed to log to-do item');
        }

        console.log('To-do item logged:', message);
      }

      // Send the conversation to the chat API
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: validMessages, userName: 'defaultUser' }),
      });

      if (!chatResponse.ok) {
        throw new Error(`HTTP error! status: ${chatResponse.status}`);
      }

      const chatData = await chatResponse.json();
      console.log('Received chat data:', chatData);

      // Update to handle the response format correctly
      const aiMessage = chatData.response;
      console.log('AI Message:', aiMessage);
      setMessages(prevMessages => [...prevMessages, { text: aiMessage, isUser: false }]);
      
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <div className="flex flex-col h-full border-2 border-blue-300 rounded-lg">
      <div className="flex-grow overflow-y-auto space-y-4 p-4" style={{ maxHeight: '80vh' }}>
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
      </div>
      <MessageInput
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isResponding={isResponding}
      />
    </div>
  );
}