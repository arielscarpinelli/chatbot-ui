"use client"

import { ChatbotUIContext } from "@/context/context"
import { useContext, useEffect, useState } from "react"
import { MessageMarkdown } from "../messages/message-markdown"
import { IconX } from "@tabler/icons-react"

export const DocSidePanel = () => {
  const { showDocSidePanel, setShowDocSidePanel, docLink } =
    useContext(ChatbotUIContext)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const isPDF = docLink.toLowerCase().endsWith(".pdf")

  useEffect(() => {
    if (docLink && !isPDF) {
      setLoading(true)
      fetch(`/api/retrieval/fetch-doc?filePath=${docLink}`)
        .then(res => res.text())
        .then(setContent)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [docLink, isPDF])

  if (!showDocSidePanel) {
    return null
  }

  return (
    <div className="bg-sidebar border-l-2 p-4 w-[400px] h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="font-bold text-lg">Document</div>
        <IconX
          className="cursor-pointer"
          onClick={() => setShowDocSidePanel(false)}
        />
      </div>

      <div className="flex-grow overflow-y-auto">
        {loading ? (
          <div>Loading...</div>
        ) : isPDF ? (
          <iframe src={docLink} className="w-full h-full" />
        ) : (
          <MessageMarkdown content={content} />
        )}
      </div>
    </div>
  )
}
