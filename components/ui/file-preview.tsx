import { MessageMarkdown } from "@/components/messages/message-markdown"
import { ChatbotUIContext } from "@/context/context"
import { getFileFromStorage } from "@/db/storage/files"
import { Tables } from "@/supabase/types"
import { ChatFile, MessageImage } from "@/types"
import Image from "next/image"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { DrawingCanvas } from "../utility/drawing-canvas"
import { Skeleton } from "./skeleton"

interface FilePreviewProps {
  type: "image" | "file" | "file_item" | null
  item: ChatFile | MessageImage | Tables<"file_items"> | Tables<"files"> | null
}

export const FilePreview: FC<FilePreviewProps> = ({ type, item }) => {
  const { filePreviewFileItem, setFilePreviewFileItem } =
    useContext(ChatbotUIContext)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [content, setContent] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (type === "file" && item) {
      const file = item as Tables<"files">
      setLoading(true)
      getFileFromStorage(file.file_path)
        .then(url => fetch(url))
        .then(response => response.text())
        .then(textContent => {
          setContent(textContent)
          setLoading(false)
        })
    }
  }, [type, item])

  useEffect(() => {
    if (filePreviewFileItem && scrollRef.current && !loading) {
      const metadata = filePreviewFileItem.metadata as any
      if (metadata) {
        const validHeaders = ["#", "##", "###", "####", "#####", "######"]
        const headers = Object.keys(metadata)
          .filter(key => validHeaders.includes(key))
          .map(key => metadata[key])

        const firstHeader = headers[headers.length - 1]

        if (firstHeader) {
          const elements = scrollRef.current.querySelectorAll(
            "h1, h2, h3, h4, h5, h6"
          )
          const targetElement = Array.from(elements).find(element =>
            element.textContent?.includes(firstHeader)
          )

          if (targetElement) {
            targetElement.scrollIntoView({
              block: "start",
              behavior: "smooth"
            })
          }
        }
      }
      setFilePreviewFileItem(null)
    }
  }, [filePreviewFileItem, loading])

  if (!type || !item) return null

  return (
    <>
      {(() => {
        if (type === "image") {
          const imageItem = item as MessageImage

          return imageItem.file ? (
            <DrawingCanvas imageItem={imageItem} />
          ) : (
            <Image
              className="rounded"
              src={imageItem.base64 || imageItem.url}
              alt="File image"
              width={2000}
              height={2000}
              style={{
                maxHeight: "67vh",
                maxWidth: "67vw"
              }}
            />
          )
        } else if (type === "file_item") {
          const fileItem = item as Tables<"file_items">
          return (
            <div
              ref={scrollRef}
              className="bg-background text-primary h-full overflow-auto rounded-xl p-4"
            >
              <MessageMarkdown content={fileItem.content || ""} />
            </div>
          )
        } else if (type === "file") {
          return (
            <div
              ref={scrollRef}
              className="bg-background text-primary h-full overflow-auto rounded-xl p-4"
            >
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <MessageMarkdown content={content} />
              )}
            </div>
          )
        }
      })()}
    </>
  )
}
