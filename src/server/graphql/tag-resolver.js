import tagRepo from "../repository/tag.js"

export default (driver) => {
    const tagRepository = tagRepo(driver)

    return {
        Query: {
            tags: async () => {
                return await tagRepository.readAll()
            }
        },
        Mutation: {
            addTag: async (parent, { tag }) => {
                console.log('Received input:', tag);
        
                await tagRepository.create(tag);
        
                return {
                message: `Tag added: ${tag.id}`,
                };
            },
            editTag: async (parent, { tag }) => {
                console.log('Received input:', tag);
        
                await tagRepository.update(tag)
                return {
                message: `Tag updated: ${tag.id}`,
                };
            },
            removeTag: async (parent, { tag }) => {
                await tagRepository.delete(tag)
                return {
                message: `Tag Removed: ${tag.id}`,
                };
            },
        }
    }
}
