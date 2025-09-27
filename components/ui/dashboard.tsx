"use client"

import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { Sidebar } from "@/components/sidebar/sidebar"
import { SidebarSwitcher } from "@/components/sidebar/sidebar-switcher"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable"
import { Tabs } from "@/components/ui/tabs"
import useHotkey from "@/lib/hooks/use-hotkey"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { ContentType } from "@/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FC, useContext, useEffect, useState } from "react"
import { useSelectFileHandler } from "../chat/chat-hooks/use-select-file-handler"
import { CommandK } from "../utility/command-k"
import { ChatbotUIContext } from "@/context/context"

export const SIDEBAR_WIDTH = 350

interface DashboardProps {
  children: React.ReactNode
}

export const Dashboard: FC<DashboardProps> = ({ children }) => {
  useHotkey("s", () => setShowSidebar(prevState => !prevState))

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabValue = searchParams.get("tab") || "chats"

  const { handleSelectDeviceFile } = useSelectFileHandler()

  const [contentType, setContentType] = useState<ContentType>(
    tabValue as ContentType
  )
  const { showSidebar, setShowSidebar, showFilePreview } =
    useContext(ChatbotUIContext)
  const [isDragging, setIsDragging] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    if (isMobile) {
      setShowSidebar(false)
    } else {
      setShowSidebar(localStorage.getItem("showSidebar") === "true")
    }
  }, [isMobile])

  const onFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    const files = event.dataTransfer.files
    const file = files[0]

    handleSelectDeviceFile(file)

    setIsDragging(false)
  }

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const shouldShowSidebar = showSidebar && !showFilePreview

  return (
    <div className="flex size-full">
      {isMobile && shouldShowSidebar && (
        <div
          className="absolute inset-0 z-40 bg-black/50"
          onClick={() => setShowSidebar(false)}
        />
      )}
      <CommandK />

      <ResizablePanelGroup direction="horizontal" autoSaveId="dashboard-layout">
        <ResizablePanel className={showFilePreview ? "hidden md:flex" : "flex"}>
          <div
            className={cn(
              "duration-200 dark:border-none",
              isMobile ? "bg-background absolute z-50 h-full" : "relative",
              shouldShowSidebar && "border-r-2"
            )}
            style={{
              // Sidebar
              minWidth: shouldShowSidebar ? `${SIDEBAR_WIDTH}px` : "0px",
              maxWidth: shouldShowSidebar ? `${SIDEBAR_WIDTH}px` : "0px",
              width: shouldShowSidebar ? `${SIDEBAR_WIDTH}px` : "0px"
            }}
          >
            {shouldShowSidebar && (
              <Tabs
                className="flex h-full"
                value={contentType}
                onValueChange={tabValue => {
                  setContentType(tabValue as ContentType)
                  router.replace(`${pathname}?tab=${tabValue}`)
                }}
              >
                <SidebarSwitcher onContentTypeChange={setContentType} />

                <Sidebar contentType={contentType} showSidebar={showSidebar} />
              </Tabs>
            )}
          </div>

          <div
            className="bg-muted/50 relative w-screen min-w-[90%] grow flex-col sm:flex sm:min-w-fit"
            onDrop={onFileDrop}
            onDragOver={onDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          >
            {isDragging ? (
              <div className="flex h-full items-center justify-center bg-black/50 text-2xl text-white">
                drop file here
              </div>
            ) : (
              children
            )}
          </div>
        </ResizablePanel>

        {showFilePreview && (
          <>
            <ResizableHandle withHandle className="hidden md:flex" />
            <ResizablePanel
              className="sm:w-full"
              defaultSize={40}
              minSize={30}
              maxSize={50}
            >
              <RightSidebar />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}
