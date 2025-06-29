import { NextRequest, NextResponse } from "next/server"

interface ChatRequest {
  messageContent?: string
  attachments?: Array<{
    mimeType: string
    data: string
  }>
}

export async function POST(request: NextRequest) {
  try {
    const { messageContent, attachments }: ChatRequest = await request.json()

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                ...(messageContent ? [{ text: messageContent }] : []),
                ...(attachments?.map((attachment) => ({
                  inlineData: {
                    mimeType: attachment.mimeType,
                    data: attachment.data,
                  },
                })) || []),
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()

      if (response.status === 429) {
        return NextResponse.json(
          { error: "API quota exceeded. Please wait and try again later." },
          { status: 429 }
        )
      }

      return NextResponse.json(
        { error: errorData.error?.message || "Failed to get response from AI" },
        { status: response.status }
      )
    }

    const data = await response.json()
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not process your request."

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
