import repo from "../repository/common.js"

export default (driver) => {
    const repository = repo(driver)

    return {
        all: async (type) => {let results = await repository.readAll(type); console.log(type); console.log(results); return results;},
        one: async (obj) => {return await repository.read(obj)},
        create: async (type, obj) => {await repository.create(type, obj)},
        update: async (obj) => {await repository.update(obj)},
        delete: async (obj) => {await repository.delete(obj)},
        relateContains: async (id1, id2) => {await repository.relateContains(id1, id2)},
        relateTagged: async (id1, id2) => {await repository.relateTagged(id1, id2)}
    }
}
