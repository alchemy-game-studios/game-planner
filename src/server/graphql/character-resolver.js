import repo from "../repository/common.js"

export default (driver) => {
    const characterRepository = repo(driver)

    return {
        Query: {
            characters: async () => {
                return await characterRepository.readAll()
            }
        },
        Mutation: {
            addCharacter: async (parent, { character }) => {
                console.log('Received input:', character);
        
                await characterRepository.create(character);
        
                return {
                message: `Character added: ${character.id}`,
                };
            },
            editCharacter: async (parent, { character }) => {
                console.log('Received input:', character);
        
                await characterRepository.update(character)
                return {
                message: `Character updated: ${character.id}`,
                };
            },
            removeCharacter: async (parent, { character }) => {
                await characterRepository.delete(character)
                return {
                message: `Character Removed: ${character.id}`,
                };
            },
        }
    }
}
