import { v4 as uuidv4 } from 'uuid'

const NewobjRepository = function(driver) {   
  const dbCall = async (call) => {
    const session = driver.session();
       
    try {
      return await call(session)

    } catch (error) {
      console.error("DB Error:", error);
      throw new Error("DB Error");
    } finally {
      session.close();
    }
  }

  return {
    create: async (type, obj) => {
        return dbCall(async (session) => {
            const command = `CREATE(o:${type} $obj);`
            obj.id = uuidv4()

            await session.run(command, {obj: obj});
        })
    },
    read: async (obj) => {
        return dbCall(async(session) => {
            const command = `
             MATCH (o1)-[:CONTAINS]->(o2)
             WHERE o1.id = "$id"
             WITH o1, o2, toLower(labels(o2)[0]) AS label
             
             WITH o1, 
                  collect(apoc.map.merge(properties(o2), {_nodeType: label})) AS contents
             
             OPTIONAL MATCH (o1)-[:TAGGED]->(tag)
             WITH o1, contents, collect(tag) AS tags
             
             RETURN {
               id: o1.id,
               properties: properties(o1),
               tags: [tag IN tags | properties(tag)],
               contents: contents
             } AS o1;
            `
            const result = await session.run(command, {id: obj.id});
            return result;
        })
    },
    readAll: async (type) => {
        const command = `
           MATCH (o1:${type})-[:CONTAINS]->(o2)
            WITH o1, o2, toLower(labels(o2)[0]) AS label
             
             WITH o1, 
              collect({
                  _nodeType: label, 
                  properties: properties(o2)
              }) AS contents
             
             OPTIONAL MATCH (o1)-[:TAGGED]->(tag)
             WITH o1, contents, collect(tag) AS tags
             
            WITH {
              id: o1.id,
              properties: properties(o1),
              tags: [tag IN tags | properties(tag)],
              contents: contents
            } AS object

            RETURN collect(object) AS results;

        `
        return dbCall(async(session) => {
            const result = await session.run(command);
            return result.records[0].get("results");
        })
    },
    update: async (updated)=> {
        return dbCall(async (session) => {
            const command = "MATCH (o {id: $id }) \
                    SET o += $updated;"

            await session.run(command, {id: updated.id, updated: updated});
        })
    },
    delete: async (obj) => {
        return dbCall(async (session) => {
            const command = `MATCH (o {id: $id }) \
                    DETACH DELETE o;`

            await session.run(command, {id: obj.id});
        })
    },
    relateContains: async(id1, id2) => {
        return dbCall(async (session) => {
            const command = `MATCH (x {id: $obj1Id}), (y {id: $obj2Id})
                    CREATE (x)-[:CONTAINS]->(y)`

            await session.run(command, {obj1Id: id1, obj2Id: id2});
        })
    },
    relateTagged: async(id1, id2) => {
        return dbCall(async (session) => {
            const command = `MATCH (x {id: $objId}), (y {id: $tagId})
                    CREATE (x)-[:TAGGED]->(y)`

            await session.run(command, {objId: id1, tagId: id2});
        })
    },
  }
}

export default NewobjRepository