import placeRepo from "../repository/place.js"

export default (driver) => {
    const placeRepository = placeRepo(driver)

    return {
        Query: {
            places: async () => {
                return await placeRepository.readAll()
            }
        },
        Mutation: {
            addPlace: async (parent, { place }) => {
                console.log('Received input:', place);
        
                await placeRepository.create(place);
        
                return {
                message: `Place added: ${place.id}`,
                };
            },
            editPlace: async (parent, { place }) => {
                console.log('Received input:', place);
        
                await placeRepository.update(place)
                return {
                message: `Place updated: ${place.id}`,
                };
            },
            removePlace: async (parent, { place }) => {
                await placeRepository.delete(place)
                return {
                message: `Place Removed: ${place.id}`,
                };
            },
        }
    }
}
