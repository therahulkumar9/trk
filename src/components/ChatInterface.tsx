"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, SendHorizonal } from "lucide-react"

const ChatInterface: React.FC = () => {
  const [message, setMessage] = React.useState<string>("")

  const handleSend = (): void => {
    const trimmed = message.trim()
    if (trimmed) {
      console.log("Sending message:", trimmed)
      setMessage("")
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-background text-center">
      <div className="max-w-4xl w-full mx-auto">
        {/* Logo */}
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-xl animate-pulse cursor-pointer"
          role="img"
          aria-label="App logo"
        >
          <span className="text-white text-2xl sm:text-3xl font-bold">TRK</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
          Your AI-Powered{" "}
          <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            Assistant
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-3xl mx-auto">
          Experience the future of AI interaction. Upload files, ask questions,
          and get intelligent responses in seconds.
        </p>

        {/* CTA */}
        <Button
          onClick={() => {
            const el = document.getElementById("chat-input")
            el?.scrollIntoView({ behavior: "smooth", block: "center" })
          }}
          className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 mb-20"
        >
          Get Started
          <ArrowRight size={20} className="ml-2" />
        </Button>

        {/* Chat Input Section */}
        <div
          id="chat-input"
          className="bg-white dark:bg-zinc-900 border border-border rounded-2xl p-6 shadow-lg max-w-2xl w-full mx-auto"
        >
          <Textarea
            value={message}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setMessage(e.target.value)
            }
            placeholder="Type your message here..."
            className="text-base min-h-[100px] resize-none"
          />
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleSend}
              variant="secondary"
              className="flex items-center gap-2 cursor-pointer"
              disabled={!message.trim()}
            >
              Send
              <SendHorizonal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
