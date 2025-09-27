"use client"

import { IconMenu2 } from "@tabler/icons-react"
import { FC, useContext } from "react"
import { Button } from "./button"
import { ChatbotUIContext } from "@/context/context"
import { useMediaQuery } from "@/lib/hooks/use-media-query"

export const HamburguerButton: FC<{}> = ({}) => {
  const { setShowSidebar } = useContext(ChatbotUIContext)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const handleToggleSidebar = () => {
    setShowSidebar(prevState => {
      const newState = !prevState
      if (!isMobile) {
        localStorage.setItem("showSidebar", String(newState))
      }
      return newState
    })
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleToggleSidebar}>
      <IconMenu2 />
    </Button>
  )
}
