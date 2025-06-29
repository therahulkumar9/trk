/* eslint-disable */

"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  Send,
  X,
  Copy,
  Check,
  Sun,
  Moon,
  Paperclip,
  Image,
  FileText,
  File,
  Mic,
  Code,
  Lightbulb,
  FileBarChart,
  Sparkles,
  Eye,
  GraduationCap,
  BarChart3,
  Volume2,
  ArrowRight,
  Zap,
  Shield,
  Globe,
} from "lucide-react"
import { useTheme } from "next-themes"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  attachments?: Array<{
    type: string
    name: string
    url: string
    data?: string
    mimeType: string
  }>
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<
    Array<{
      type: string
      name: string
      url: string
      data?: string
      mimeType: string
    }>
  >([])
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [copiedCodeBlock, setCopiedCodeBlock] = useState<string | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { theme, setTheme } = useTheme()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  // Supported file types by Gemini
  const supportedMimeTypes = [
    // Images
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/heic",
    "image/heif",
    // Documents
    "application/pdf",
    // Text files
    "text/plain",
    "text/html",
    "text/css",
    "text/javascript",
    "text/typescript",
    "text/csv",
    "text/markdown",
    "text/x-python",
    "text/x-java-source",
    "text/x-c",
    "text/x-c++src",
    "text/x-csharp",
    "text/x-php",
    // Audio
    "audio/wav",
    "audio/mp3",
    "audio/aiff",
    "audio/aac",
    "audio/ogg",
    "audio/flac",
    // Video
    "video/mp4",
    "video/mpeg",
    "video/mov",
    "video/avi",
    "video/x-flv",
    "video/mpg",
    "video/webm",
    "video/wmv",
    "video/3gpp",
  ]

  const suggestionButtons = [
    {
      icon: FileText,
      text: "Help me write",
      color:
        "text-purple-500 border-purple-500/20 hover:bg-purple-50 dark:hover:bg-purple-900/20",
    },
    {
      icon: Code,
      text: "Code",
      color:
        "text-blue-500 border-blue-500/20 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    },
    {
      icon: Lightbulb,
      text: "Make a plan",
      color:
        "text-yellow-500 border-yellow-500/20 hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
    },
    {
      icon: FileBarChart,
      text: "Summarize text",
      color:
        "text-orange-500 border-orange-500/20 hover:bg-orange-50 dark:hover:bg-orange-900/20",
    },
    {
      icon: Sparkles,
      text: "Surprise me",
      color:
        "text-teal-500 border-teal-500/20 hover:bg-teal-50 dark:hover:bg-teal-900/20",
    },
    {
      icon: Eye,
      text: "Analyze images",
      color:
        "text-indigo-500 border-indigo-500/20 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
    },
    {
      icon: GraduationCap,
      text: "Get advice",
      color:
        "text-green-500 border-green-500/20 hover:bg-green-50 dark:hover:bg-green-900/20",
    },
    {
      icon: BarChart3,
      text: "Analyze data",
      color:
        "text-cyan-500 border-cyan-500/20 hover:bg-cyan-50 dark:hover:bg-cyan-900/20",
    },
  ]

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get instant responses powered by advanced AI technology",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your conversations are encrypted and kept confidential",
    },
    {
      icon: Globe,
      title: "Multi-format Support",
      description: "Upload images, documents, audio, and video files",
    },
  ]

  // Next.js hydration fix
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      const scrollHeight = textareaRef.current.scrollHeight
      const maxHeight = 200
      textareaRef.current.style.height =
        Math.min(scrollHeight, maxHeight) + "px"
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [inputMessage])

  // Focus management
  useEffect(() => {
    const focusTextarea = () => {
      if (textareaRef.current && !isLoading && !isListening) {
        textareaRef.current.focus()
      }
    }

    setTimeout(focusTextarea, 100)

    if (messages.length > 0 && !isLoading) {
      setTimeout(focusTextarea, 300)
    }
  }, [messages.length, isLoading, isListening])

  // Improved speech recognition
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          setInputMessage((prev) => prev + finalTranscript + " ")
        }
      }

      recognitionRef.current.onstart = () => {
        setIsListening(true)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error("Failed to copy")
    }
  }

  const copyCodeBlock = async (code: string, blockId: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCodeBlock(blockId)
      setTimeout(() => setCopiedCodeBlock(null), 2000)
    } catch (err) {
      console.error("Failed to copy code")
    }
  }

  // Improved speech synthesis
  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()

      if (isSpeaking) {
        setIsSpeaking(false)
        return
      }

      const cleanText = text
        .replace(/```[\s\S]*?```/g, " [code block] ")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/#+ /g, "")
        .replace(/\n+/g, " ")
        .trim()

      const utterance = new SpeechSynthesisUtterance(cleanText)

      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(
        (voice) =>
          voice.name.includes("Google") ||
          voice.name.includes("Microsoft") ||
          voice.lang.includes("en-US")
      )

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      utterance.onstart = () => {
        setIsSpeaking(true)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
      }

      utterance.onerror = (event) => {
        setIsSpeaking(false)
        console.error("Speech error:", event)
      }

      window.speechSynthesis.speak(utterance)
    }
  }

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error("Speech recognition start error:", error)
      }
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/"))
      return <Image size={16} className="text-blue-500" />
    if (mimeType === "application/pdf")
      return <FileText size={16} className="text-red-500" />
    if (mimeType.startsWith("audio/"))
      return <File size={16} className="text-green-500" />
    if (mimeType.startsWith("video/"))
      return <File size={16} className="text-purple-500" />
    return <File size={16} className="text-gray-500" />
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (!supportedMimeTypes.includes(file.type)) {
        console.error(`File type ${file.type} is not supported`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const base64Data = e.target?.result as string
        setAttachments((prev) => [
          ...prev,
          {
            type: file.type.split("/")[0],
            name: file.name,
            url: URL.createObjectURL(file),
            data: base64Data.split(",")[1],
            mimeType: file.type,
          },
        ])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
    setTimeout(() => {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(
        suggestion.length,
        suggestion.length
      )
    }, 0)
  }

  const canSendMessage = () => {
    return (inputMessage.trim() || attachments.length > 0) && !isLoading
  }

  const sendMessage = async () => {
    if (!canSendMessage()) return

    const messageContent = inputMessage.trim()
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      isUser: true,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    }

    setInputMessage("")
    setAttachments([])

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageContent,
          attachments: userMessage.attachments,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get response from AI")
      }

      const data = await response.json()
      const aiResponse = data.response

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again."

      const errorChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `❌ Error: ${errorMessage}`,
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorChatMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()

      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop()
      }

      sendMessage()
    }
  }

  const formatMessage = (content: string) => {
    let formatted = content

    // Store code blocks temporarily to prevent markdown processing
    const codeBlocks: string[] = []
    const codeBlockPlaceholders: string[] = []

    // Extract code blocks first
    formatted = formatted.replace(
      /```(\w+)?\n?([\s\S]*?)```/g,
      (match, language, code) => {
        const blockId = Math.random().toString(36).substr(2, 9)
        const trimmedCode = code.trim()
        const lang = language || "text"

        const codeBlockHtml = `<div class="code-block-wrapper my-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div class="code-header bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <span class="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">${lang}</span>
          <button 
            class="copy-code-btn text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-gray-700 dark:text-gray-200 transition-all duration-200 font-medium hover:shadow-sm" 
            data-code="${encodeURIComponent(trimmedCode)}" 
            data-block-id="${blockId}"
          >
            Copy code
          </button>
        </div>
        <pre class="code-content bg-gray-50 dark:bg-gray-900 p-4 overflow-x-auto"><code class="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre leading-relaxed">${trimmedCode}</code></pre>
      </div>`

        const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`
        codeBlocks.push(codeBlockHtml)
        codeBlockPlaceholders.push(placeholder)
        return placeholder
      }
    )

    // Store inline code temporarily
    const inlineCodes: string[] = []
    const inlineCodePlaceholders: string[] = []

    formatted = formatted.replace(/`([^`]+)`/g, (match, code) => {
      const inlineCodeHtml = `<code class="inline-code bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">${code}</code>`
      const placeholder = `__INLINE_CODE_${inlineCodes.length}__`
      inlineCodes.push(inlineCodeHtml)
      inlineCodePlaceholders.push(placeholder)
      return placeholder
    })

    // Now apply other markdown formatting (after code is protected)
    // Handle headings with better spacing and styling
    formatted = formatted.replace(
      /^### (.*$)/gim,
      '<h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">$1</h3>'
    )
    formatted = formatted.replace(
      /^## (.*$)/gim,
      '<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-5 border-b-2 border-gray-300 dark:border-gray-600 pb-3">$1</h2>'
    )
    formatted = formatted.replace(
      /^# (.*$)/gim,
      '<h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-6 border-b-2 border-gray-400 dark:border-gray-500 pb-4">$1</h1>'
    )

    // Handle bold and italic with better styling
    formatted = formatted.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-bold text-gray-900 dark:text-gray-100 bg-yellow-50 dark:bg-yellow-900/20 px-1 rounded">$1</strong>'
    )
    formatted = formatted.replace(
      /\*(.*?)\*/g,
      '<em class="italic text-gray-700 dark:text-gray-300 font-medium">$1</em>'
    )

    // Handle lists with better spacing and bullet points
    formatted = formatted.replace(
      /^\d+\.\s(.*)$/gm,
      '<div class="flex items-start mb-3 pl-2"><span class="font-bold text-blue-600 dark:text-blue-400 mr-3 min-w-fit text-sm">•</span><span class="text-gray-800 dark:text-gray-200 leading-relaxed">$1</span></div>'
    )
    formatted = formatted.replace(
      /^[-*]\s(.*)$/gm,
      '<div class="flex items-start mb-3 pl-2"><span class="text-blue-500 dark:text-blue-400 mr-3 mt-1 text-lg leading-none">•</span><span class="text-gray-800 dark:text-gray-200 leading-relaxed">$1</span></div>'
    )

    // Handle blockquotes
    formatted = formatted.replace(
      /^> (.*)$/gm,
      '<blockquote class="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-900/20 italic text-gray-700 dark:text-gray-300 rounded-r-lg">$1</blockquote>'
    )

    // Handle paragraphs with better spacing
    formatted = formatted.replace(
      /\n\n/g,
      '</p><p class="mb-4 text-gray-800 dark:text-gray-200 leading-relaxed text-base">'
    )
    formatted = `<p class="mb-4 text-gray-800 dark:text-gray-200 leading-relaxed text-base">${formatted}</p>`

    // Clean up empty paragraphs
    formatted = formatted.replace(/<p class="[^"]*"><\/p>/g, "")

    // Restore inline code
    inlineCodePlaceholders.forEach((placeholder, index) => {
      formatted = formatted.replace(placeholder, inlineCodes[index])
    })

    // Restore code blocks
    codeBlockPlaceholders.forEach((placeholder, index) => {
      formatted = formatted.replace(placeholder, codeBlocks[index])
    })

    return formatted
  }

  useEffect(() => {
    const handleCopyClick = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.classList.contains("copy-code-btn")) {
        const code = decodeURIComponent(target.getAttribute("data-code") || "")
        const blockId = target.getAttribute("data-block-id") || ""
        copyCodeBlock(code, blockId)
      }
    }

    document.addEventListener("click", handleCopyClick)
    return () => document.removeEventListener("click", handleCopyClick)
  }, [])

  // Don't render until mounted (Next.js hydration fix)
  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors duration-300">
      {/* Header - Only show when there are messages */}
      {messages.length > 0 && (
        <header className="sticky top-0 z-50 border-b border-gray-200/80 dark:border-gray-800/80 bg-white/95 dark:bg-black/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-black/80 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 max-w-5xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">TRK</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  TRK Assistant
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  AI Chat Interface
                </p>
              </div>
            </div>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-10 h-10 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>
      )}

      {/* Chat Messages */}
      <div
        className={`flex-1 overflow-y-auto ${
          attachments.length > 0 ? "pb-48" : "pb-32"
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {messages.length === 0 && (
            <div className="min-h-screen flex flex-col">
              {/* Navigation Header */}
              <nav className="flex items-center justify-between py-6 px-4 sm:px-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">TRK</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    TRK Assistant
                  </span>
                </div>

                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-10 h-10 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors flex items-center justify-center"
                >
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </nav>

              {/* Hero Section */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
                <div className="max-w-4xl mx-auto">
                  {/* Logo */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-2xl animate-pulse">
                    <span className="text-white text-2xl sm:text-3xl font-bold">
                      TRK
                    </span>
                  </div>

                  {/* Main Heading */}
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
                    Your AI-Powered
                    <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                      Assistant
                    </span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-3xl mx-auto">
                    Experience the future of AI interaction. Upload files, ask
                    questions, and get intelligent responses in seconds.
                  </p>

                  {/* CTA Button */}
                  <button
                    onClick={() => textareaRef.current?.focus()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 mb-16 flex items-center gap-2 mx-auto"
                  >
                    Get Started
                    <ArrowRight size={20} />
                  </button>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                        <feature.icon size={24} className="text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Suggestion Buttons */}
                <div className="w-full max-w-5xl">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
                    Popular Actions
                  </h2>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                    {suggestionButtons.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion.text)}
                        className={`flex items-center justify-center gap-3 p-6 h-auto border-2 rounded-2xl transition-all duration-200 text-center hover:scale-105 hover:shadow-lg ${suggestion.color}`}
                      >
                        <suggestion.icon size={24} className="flex-shrink-0" />
                        <span className="text-sm font-semibold">
                          {suggestion.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto mb-16">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      100+
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      File Formats
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      24/7
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Availability
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                      Instant
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Responses
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <footer className="border-t mt-[-40px] border-gray-200 dark:border-gray-700 pt-8 w-full max-w-4xl mx-auto">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Powered by advanced AI technology
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Created with ❤️ by Rahul Kumar
                    </p>
                  </div>
                </footer>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className="py-8 border-b border-gray-100 dark:border-gray-800/50 last:border-b-0"
            >
              <div className="max-w-4xl mx-auto">
                {message.isUser ? (
                  <div className="flex space-x-4 sm:space-x-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white text-sm font-bold">U</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        You
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>

                      {message.attachments && (
                        <div className="mb-4 space-y-3">
                          {message.attachments.map((attachment, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-3"
                            >
                              {attachment.mimeType.startsWith("image/") ? (
                                <img
                                  src={attachment.url}
                                  alt={attachment.name}
                                  className="max-w-sm max-h-64 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-lg hover:shadow-xl transition-shadow"
                                />
                              ) : (
                                <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700">
                                  {getFileIcon(attachment.mimeType)}
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {attachment.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {message.content && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
                          <div className="text-gray-800 dark:text-gray-200 text-base leading-relaxed">
                            {message.content}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-4 sm:space-x-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white text-sm font-bold">TRK</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          TRK Assistant
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            title="button-volume2"
                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center"
                            onClick={() => speakText(message.content)}
                          >
                            <Volume2
                              size={16}
                              className={`${
                                isSpeaking
                                  ? "text-blue-600"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            />
                          </button>
                          <button
                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center"
                            onClick={() =>
                              copyToClipboard(message.content, message.id)
                            }
                          >
                            {copiedMessageId === message.id ? (
                              <Check size={16} className="text-green-600" />
                            ) : (
                              <Copy
                                size={16}
                                className="text-gray-500 dark:text-gray-400"
                              />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                        <div
                          className="prose prose-lg max-w-none text-gray-800 dark:text-gray-200 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: formatMessage(message.content),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="py-8">
              <div className="max-w-4xl mx-auto">
                <div className="flex space-x-4 sm:space-x-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white text-sm font-bold">TRK</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      TRK Assistant
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Voice Recording Indicator */}
      {isListening && (
        <div
          className={`fixed left-0 right-0 z-40 ${
            attachments.length > 0 ? "bottom-36" : "bottom-28"
          }`}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center space-x-3 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <Mic size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  🎤 Listening... Click the mic again to stop
                </p>
              </div>
              <button
                onClick={() => recognitionRef.current?.stop()}
                className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/30 px-3 py-1 rounded text-sm"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachments Preview - Fixed positioning above input */}
      {attachments.length > 0 && (
        <div className="fixed bottom-24 left-0 right-0 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-40 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Attachments ({attachments.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-3 max-h-32 overflow-y-auto">
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 flex items-center space-x-3 shadow-sm hover:shadow-md transition-shadow min-w-0"
                >
                  {attachment.mimeType.startsWith("image/") ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getFileIcon(attachment.mimeType)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block truncate">
                      {attachment.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {attachment.type}
                    </span>
                  </div>
                  <button
                    title="button-x"
                    className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 flex-shrink-0 flex items-center justify-center rounded"
                    onClick={() => removeAttachment(index)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area - Fixed alignment and responsive */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200/80 dark:border-gray-800/80 bg-white/95 dark:bg-black/95 backdrop-blur-sm z-50">
        <div className="max-w-4xl mx-auto p-3 sm:p-4">
          <div className="relative flex items-end gap-2 sm:gap-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-300 dark:border-gray-600 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200 p-1">
            {/* Upload button inside */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex-shrink-0 h-10 w-10 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors ml-1 flex items-center justify-center"
              title="Upload file"
            >
              <Paperclip
                size={18}
                className="text-gray-500 dark:text-gray-400"
              />
            </button>

            {/* Textarea - properly aligned */}
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  messages.length === 0
                    ? "Ask TRK anything..."
                    : "Continue the conversation..."
                }
                className="min-h-[40px] h-[40px] max-h-[200px] resize-none border-0 bg-transparent focus:ring-0 focus-visible:ring-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-2 py-2 text-sm sm:text-base w-full outline-none"
                disabled={isLoading}
              />
            </div>

            {/* Voice and Send buttons - properly aligned */}
            <div className="flex items-center gap-1 mr-1">
              <button
                className={`h-10 w-10 p-0 rounded-xl transition-all duration-200 flex items-center justify-center ${
                  isListening
                    ? "text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                    : "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                }`}
                onClick={handleVoiceInput}
                disabled={isLoading}
                title={isListening ? "Stop recording" : "Start voice recording"}
              >
                <Mic size={18} />
              </button>

              <button
                onClick={sendMessage}
                disabled={!canSendMessage()}
                className={`h-10 w-10 p-0 rounded-xl transition-all duration-200 flex items-center justify-center ${
                  canSendMessage()
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                }`}
                title="Send message (Enter)"
              >
                <Send size={18} />
              </button>
            </div>

            <input
              placeholder="Upload files"
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept={supportedMimeTypes.join(",")}
              multiple
              className="hidden"
            />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center px-2">
            TRK can make mistakes. Check important info. Press Enter to send,
            Shift+Enter for new line.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface
