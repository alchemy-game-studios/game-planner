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
            WHERE o1.id = $o1Id
            WITH o1, o2, labels(o2) AS o2Labels
            UNWIND o2Labels AS label
            WITH o1, label, collect(o2) AS groupedNodes

            OPTIONAL MATCH (o1)-[:TAGGED]->(tag)
            WITH o1, 
                collect({label: label, nodes: groupedNodes}) AS groupedByType,
                collect(tag) AS tags

            RETURN {
            id: o1.id,
            properties: properties(o1), 
            tags: [tag IN tags | properties(tag)], 
            contents: 
                REDUCE(result = {}, entry IN groupedByType | 
                result + { [entry.label]: entry.nodes }) 
            } AS o1
            `
            const result = await session.run(command, {id: obj.id});
            return result.records[0].get("o1").properties;
        })
    },
    readAll: async (type) => {
        const command = `
           MATCH (o1:${type})
            OPTIONAL MATCH (o1)-[:CONTAINS]->(o2)
            WITH o1, collect(o2) AS groupedNodes, collect(distinct labels(o2)) AS o2Labels
            UNWIND (CASE WHEN size(o2Labels) > 0 THEN o2Labels ELSE [null] END) AS label

            WITH o1, label, groupedNodes
            OPTIONAL MATCH (o1)-[:TAGGED]->(tag)

            WITH o1, 
                collect(DISTINCT {label: label, nodes: groupedNodes}) AS groupedByType,
                collect(DISTINCT tag.id) AS tags

            RETURN {
                id: o1.id,
                properties: properties(o1),
                tags: tags,
                contents: groupedByType
            } AS o1;

        `
        return dbCall(async(session) => {
            const result = await session.run(command);
            return result.records.map(record => record.get("o1").properties);
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