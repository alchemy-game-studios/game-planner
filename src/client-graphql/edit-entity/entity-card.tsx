'use client'

import { Badge } from "@/components/ui/badge"
import { getPlaceholderImage } from "@/media/util"

interface EntityCardProps {
  name: string
  avatarUrl: string
  fallbackText?: string
  day?: number | null
  onClick?: () => void
}

export default function EntityCard({
  name,
  avatarUrl,
  day,
  onClick
}: EntityCardProps) {
  const placeholderUrl = getPlaceholderImage('avatar');

  return (
    <div onClick={onClick} className="gap-4 mt-4 w-full">
      <Badge
        variant="secondary"
        className="pl-4 w-full min-h-15 hover:bg-muted hover:text-foreground cursor-pointer transition-colors duration-200 p-3 "
      >
        <div className="flex justify-start gap-4 w-full ">
          <div className="w-1/4">
            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted">
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = placeholderUrl;
                }}
              />
            </div>
          </div>
          <div className="text-2xl w-3/4 flex items-center justify-start">
            <div className="flex flex-col items-start">
              <p className="m-0 leading-none font-primary">{name}</p>
              {day !== undefined && day !== null && (
                <span className="text-xs text-secondary mt-1">Day {day}</span>
              )}
            </div>
          </div>
        </div>
      </Badge>
    </div>
  )
}
