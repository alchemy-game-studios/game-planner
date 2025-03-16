import repo from "../repository/common.js"

export default (driver) => {
    const repository = repo(driver)

    return {
        all: async (type) => {await repository.readAll(type)},
        one: async (obj) => {await repository.read(obj)},
        create: async (type, obj) => {await repository.create(type, obj)},
        update: async (obj) => {await repository.update(obj)},
        delete: async (obj) => {await repository.delete(obj)},
        relateContains: async (obj1, obj2) => {await repository.relateContains(obj1, obj2)},
        relateTagged: async (obj, tag) => {await repository.relateContains(obj, tag)}
    }
}
