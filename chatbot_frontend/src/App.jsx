import { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaRobot, FaUser } from "react-icons/fa";
import { motion } from "framer-motion";

const Chatbot = () => {
  const [messages, setMessages] = useState([{ sender: "bot", text: "Hello! How can I assist you today?" }]);
  const [input, setInput] = useState("");
  const chatboxRef = useRef(null);
  const [isTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botMessage = { sender: "bot", text: data.response || "Error: No response" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "Sorry, there was an error!" }]);
    }

    setInput("");
  };

  useEffect(() => {
    chatboxRef.current?.scrollTo(0, chatboxRef.current.scrollHeight);
  }, [messages]);

return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-4 flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto p-2" ref={chatboxRef}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              className={`flex items-center gap-2 my-2 p-2 rounded-xl max-w-xs ${
                msg.sender === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200 self-start"
              }`}
              initial={{ opacity: 0, x: msg.sender === "user" ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {msg.sender === "user" ? (
                <FaUser className="text-xl" />
              ) : (
                <FaRobot className="text-xl text-gray-700" />
              )}
              <span>{msg.text}</span>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              className="self-start text-gray-600 p-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            >
              Bot is typing...
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};
export default Chatbot;