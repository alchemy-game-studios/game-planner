// utils/imagePaths.ts
export function getEntityImage(uuid: string, type: "avatar" | "hero"): string {
    return `/entity-images/${uuid}/${type}.jpg`
}

// Default placeholder images (using existing entity images as fallbacks)
const PLACEHOLDER_IMAGES = {
    hero: '/entity-images/1e147ce9-cc44-45a9-ae7e-97ed2ebfc382/hero.jpg',
    avatar: '/entity-images/1e147ce9-cc44-45a9-ae7e-97ed2ebfc382/avatar.jpg'
};

export function getPlaceholderImage(type: "avatar" | "hero"): string {
    return PLACEHOLDER_IMAGES[type];
}
