// utils/imagePaths.ts
export function getEntityImage(uuid: string, type: "avatar" | "hero"): string {
    return `/entity-images/${uuid}/${type}.jpg`
  }
  