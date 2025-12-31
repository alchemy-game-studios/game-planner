'use client'

import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { ReactNode } from "react"
import { X } from "lucide-react"

interface EditDrawerProps {
  label: string
  width?: number
  open: boolean
  setOpen: (value: boolean) => void
  onForceClose?: () => void
  children: ReactNode
}

export default function EditDrawer({
  label,
  width = 400,
  open,
  setOpen,
  onForceClose,
  children
}: EditDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerContent
        className="bg-card text-card-foreground border-l border-border shadow-2xl"
        style={{ width, maxWidth: "100vw", height: "100vh" }}
      >
        <div className="flex flex-col h-full px-6 py-6 font-book">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
            <h2 className="text-2xl font-heading tracking-wider">
              {label}
            </h2>
            <button
              onClick={() => {
                console.log("Close triggered")
                onForceClose?.()
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X size={22} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto pr-2 space-y-4">
            {children}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
