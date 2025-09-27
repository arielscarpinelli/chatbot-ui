"use client"

import { IconMenu2 } from "@tabler/icons-react"
import { FC } from "react"
import { Button } from "./button"

interface NavbarProps {
  onToggleSidebar: () => void
}

export const Navbar: FC<NavbarProps> = ({ onToggleSidebar }) => {
  return (
    <div className="flex h-14 w-full items-center justify-between border-b px-4">
      <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
        <IconMenu2 />
      </Button>
    </div>
  )
}