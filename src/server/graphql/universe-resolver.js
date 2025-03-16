import repo from "../repository/common.js"

export default (driver) => {
    const universeRepository = repo(driver)

    return {
        Query: {
            tags: async () => {
                return await universeRepository.readAll()
            }
        },
        Mutation: {
            addUniverse: async (parent, { tag }) => {
                console.log('Received input:', tag);
        
                await universeRepository.create(tag);
        
                return {
                message: `Universe added: ${tag.id}`,
                };
            },
            editUniverse: async (parent, { tag }) => {
                console.log('Received input:', tag);
        
                await universeRepository.update(tag)
                return {
                message: `Universe updated: ${tag.id}`,
                };
            },
            removeUniverse: async (parent, { tag }) => {
                await universeRepository.delete(tag)
                return {
                message: `Universe Removed: ${tag.id}`,
                };
            },
        }
    }
}
