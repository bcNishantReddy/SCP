import React, { useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const Chatbot = () => {
  const location = useLocation();

  // Hide chatbot on sign-in and sign-up pages
  if (location.pathname === "/auth/signin" || location.pathname === "/auth/signup") {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "bot", text: "Hello! I'm your guidance bot. How can I assist you today?" },
  ]);
  const [input, setInput] = useState("");

  const GEMINI_API_KEY = "AIzaSyCEEDmkrr2GZTm5ckiwU29_hkvp-kN0QI8";

  const systemPrompt = `You are a professional and helpful chatbot integrated into a web application. Your role is to guide users to explore various pages of the application by providing direct links for navigation. Use the "window.location.origin" object to dynamically generate URLs. Here are the available routes and their descriptions:

  - Home: [Go to Home](${window.location.origin}/index)
  - Admin Dashboard: [Go to Admin Dashboard](${window.location.origin}/admin)
  - Clubs: [Explore Clubs](${window.location.origin}/clubs)
  - Club Details: [View Club Details](${window.location.origin}/clubs/:id)
  - Events: [Discover Events](${window.location.origin}/events)
  - Groups: [Join Groups](${window.location.origin}/groups)
  - Live Feed: [View Live Feed](${window.location.origin}/feed)
  - Opportunities: [Find Opportunities](${window.location.origin}/opportunities)
  - People: [Connect with People](${window.location.origin}/people)
  - Portfolios: [Browse Portfolios](${window.location.origin}/portfolios)
  - Profile: [View Profile](${window.location.origin}/profile)
  - Projects: [Explore Projects](${window.location.origin}/projects)
  - Project Details: [View Project Details](${window.location.origin}/projects/:id)
  - Tutorials: [Learn from Tutorials](${window.location.origin}/tutorials)
  - Tutorial Details: [View Tutorial Details](${window.location.origin}/tutorials/:id)
  - Sign Up: [Sign Up](${window.location.origin}/auth/signup)

  When responding to users, provide a professional and detailed explanation. For example, if a user asks about AI/ML opportunities, you can say:

  "To start a career as an AI/ML engineer, you should focus on building a strong foundation in mathematics, programming, and machine learning concepts. Begin by learning Python and libraries like TensorFlow, PyTorch, and scikit-learn. Work on projects, participate in hackathons, and contribute to open-source AI/ML projects to gain practical experience. Additionally, consider pursuing certifications or advanced degrees in AI/ML to enhance your credentials."
  And a bit more in detail. And then, 
  Then, guide them to the relevant page on the website: "To find opportunities related to AI/ML, you can explore the following page: [Find Opportunities](${window.location.origin}/opportunities). This page provides a comprehensive list of opportunities. Once there, you can use the search or filter options to narrow down results specific to AI/ML. If you need further assistance, feel free to ask!"
  If you do not have enough info to answer the question, you can ask them back.`;

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");

    try {
      const sessionMessages = messages.map((msg) => `${msg.sender}: ${msg.text}`).join("\n");
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\n${sessionMessages}\nUser: ${userMessage}`,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const botResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";
      const formattedResponse = botResponse
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Handle **bold** text
        .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, (match, text, url) => {
          const fullUrl = url.startsWith("/") ? `${window.location.origin}${url}` : url;
          return `<a href='${fullUrl}' target='_blank' class='text-blue-500 underline'>${text}</a>`;
        });

      setMessages((prev) => [...prev, { sender: "bot", text: formattedResponse }]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "Something went wrong. Please try again later." }]);
    }
  };

  return (
    <div>
      {/* Floating Chat Button */}
      <div
        className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center cursor-pointer shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        💬
      </div>

      {/* Chat UI */}
      {isOpen && (
        <div
          className={`fixed ${isOpen ? "inset-0" : "bottom-20 right-4 w-80"} bg-white shadow-lg rounded-lg overflow-hidden`}
          style={{ minHeight: isOpen ? "99vh" : "300px", minWidth: isOpen ? "99vw" : "300px", maxHeight: isOpen ? "99vh" : "600px", maxWidth: isOpen ? "99vw" : "600px", overflow: "auto", position: "fixed", zIndex: 1050 }}
        >
          <div className="p-4 border-b bg-gray-100 flex justify-between items-center relative">
            <h3 className="text-lg font-semibold">Guidance bot</h3>
            {isOpen && (
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            )}
          </div>
          <div className="p-4 h-[calc(100%-80px)] overflow-y-auto pb-20">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-lg ${
                    msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                  }`}
                  style={{ whiteSpace: "pre-wrap" }} // Preserve new lines
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-500 underline">$1</a>')
                    }}
                  ></span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t bg-gray-100 flex items-center" style={{ position: "absolute", bottom: 0, width: "100%" }}>
            <input
              type="text"
              className="flex-1 border rounded-lg px-4 py-2 mr-2"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;