"use client"

import { ChatbotUIContext } from "@/context/context"
import { useContext } from "react"
import { MessageMarkdown } from "../messages/message-markdown"
import { IconX } from "@tabler/icons-react"

export const DocSidePanel = () => {
  const {
    showDocSidePanel,
    setShowDocSidePanel,
    docLink,
    docContent
  } = useContext(ChatbotUIContext)

  if (!showDocSidePanel) {
    return null
  }

  const isPDF = docLink.toLowerCase().endsWith(".pdf")

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
        {isPDF ? (
          <iframe src={docLink} className="w-full h-full" />
        ) : (
          <MessageMarkdown content={docContent} />
        )}
      </div>
    </div>
  )
}
