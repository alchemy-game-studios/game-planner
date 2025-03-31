'use client'

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface EntityCardProps {
  name: string
  avatarUrl: string
  fallbackText?: string
  onClick?: () => void
}

export default function EntityCard({
  name,
  avatarUrl,
  fallbackText = '??',
  onClick
}: EntityCardProps) {
  return (
    <div onClick={onClick} className="gap-4 mt-4 w-full">
      <Badge
        variant="secondary"
        className="pl-4 w-full min-h-15 hover:bg-gray-700 hover:text-gray-200 cursor-pointer transition-colors duration-200 p-3 "
      >
        <div className="flex justify-start gap-4 w-full ">
          <div className="w-1/4">
            <Avatar>
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{fallbackText}</AvatarFallback>
            </Avatar>
          </div>
          <div className="text-2xl w-3/4 flex items-center justify-start text-center">
            <p className="m-0 leading-none font-primary">{name}</p>
          </div>
        </div>
      </Badge>
    </div>
  )
}
