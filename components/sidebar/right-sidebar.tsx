import { ChatbotUIContext } from "@/context/context"
import { FC, useContext } from "react"
import { FilePreview } from "../ui/file-preview"

interface RightSidebarProps {}

export const RightSidebar: FC<RightSidebarProps> = ({}) => {
  const { showFilePreview, filePreviewItem, filePreviewType } =
    useContext(ChatbotUIContext)

  if (!showFilePreview) return null

  return (
    <div className="flex h-full flex-col">
      <FilePreview
        item={filePreviewItem}
        type={filePreviewType}
      />
    </div>
  )
}
