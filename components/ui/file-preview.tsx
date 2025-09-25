"use client"

import { MessageMarkdown } from "@/components/messages/message-markdown"
import { getFileFromStorage } from "@/db/storage/files"
import { Tables } from "@/supabase/types"
import { ChatFile, MessageImage } from "@/types"
import Image from "next/image"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { DrawingCanvas } from "../utility/drawing-canvas"
import { Skeleton } from "./skeleton"
import { ChatbotUIContext } from "@/context/context"
import { Button } from "./button"

export const FilePreview: FC<{}> = () => {
  const {
    filePreviewItem: item,
    filePreviewType: type,
    setFilePreviewItem,
    setFilePreviewType,
    files,
    chatFiles
  } = useContext(ChatbotUIContext)

  const scrollRef = useRef<HTMLDivElement>(null)
  const [content, setContent] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [contentUrl, setContentUrl] = useState<string>("")
  const [scrollHeaders, setScrollHeaders] = useState<any[]>([])

  const { t } = useTranslation()

  const showFullContent = (fileItem: Tables<"file_items">) => {
    const parentFile = [...files, ...chatFiles].find(
      f => f.id === fileItem.file_id
    )
    if (parentFile) {
      setFilePreviewItem(parentFile)
      setFilePreviewType("file")
      const metadata = fileItem.metadata as any
      if (metadata) {
        const validHeaders = ["#", "##", "###", "####", "#####", "######"]
        setScrollHeaders(
          Object.keys(metadata)
            .filter(key => validHeaders.includes(key))
            .map(key => metadata[key])
        )
      }
    }
  }

  useEffect(() => {
    if (type === "file" && item) {
      const file = item as Tables<"files">
      setLoading(true)
      const fetchData = async () => {
        try {
          const url = await getFileFromStorage(file.file_path)
          if (file.type === "markdown") {
            const response = await fetch(url)
            setContent(await response.text())
          } else {
            setContentUrl(url)
          }
          setLoading(false)
        } catch (error) {
          setContent("Error loading file content.")
          console.error("Error fetching file from storage:", error)
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [type, item])

  useEffect(() => {
    if (scrollHeaders.length && scrollRef.current && !loading) {
      const firstHeader = scrollHeaders[scrollHeaders.length - 1]

      if (firstHeader) {
        const elements = scrollRef.current.querySelectorAll(
          "h1, h2, h3, h4, h5, h6"
        )
        const elementsArray = Array.from(elements)
        const targetElements = elementsArray
          .map((element, index) => ({ element, index }))
          .filter(element =>
            element.element.textContent?.includes(
              firstHeader.replaceAll("*", "")
            )
          )

        let targetElement
        if (targetElements.length === 1) {
          targetElement = targetElements[0].element
        } else {
          const secondHeader =
            scrollHeaders.length > 1 && scrollHeaders[scrollHeaders.length - 2]
          if (secondHeader) {
            const filteredBySecond = targetElements.filter(te => {
              elementsArray.find(
                (e, index) =>
                  e.textContent?.includes(secondHeader.replaceAll("*", "")) &&
                  index < te.index
              )
            })

            targetElement = filteredBySecond.length
              ? filteredBySecond[0].element
              : targetElements[0].element
          } else {
            targetElement = targetElements[0].element
          }
        }

        if (targetElement) {
          targetElement.scrollIntoView({
            block: "start"
          })
        }
      }
      setScrollHeaders([])
    }
  }, [scrollHeaders, loading])

  if (!type || !item) return null

  if (type === "image") {
    const imageItem = item as MessageImage

    return imageItem.file ? (
      <DrawingCanvas imageItem={imageItem} />
    ) : (
      <Image
        className="w-full rounded"
        src={imageItem.base64 || imageItem.url}
        alt={t("File image")}
      />
    )
  } else if (type === "file_item") {
    const fileItem = item as Tables<"file_items">
    return (
      <div className="bg-background text-primary h-full overflow-auto rounded-xl p-4">
        <MessageMarkdown content={fileItem.content || ""} />
        <div className="mt-4 flex justify-center">
          <Button size="sm" onClick={() => showFullContent(fileItem)}>
            {t("Show full content")}
          </Button>
        </div>
      </div>
    )
  } else if (type === "file") {
    const filePath = (item as Tables<"files">).file_path
    const lastSlash = filePath.lastIndexOf("/")
    const prefixPath = lastSlash !== -1 ? filePath.slice(0, lastSlash + 1) : ""

    return contentUrl ? (
      <iframe src={contentUrl} className="size-full" />
    ) : (
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
          <MessageMarkdown content={content} prefixPath={prefixPath} />
        )}
      </div>
    )
  }
}
