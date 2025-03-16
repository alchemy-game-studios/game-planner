import { v4 as uuidv4 } from 'uuid'

const NewTagRepository = function(driver) {   
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
    create: async (tag) => {
        return dbCall(async (session) => {
            const command = `CREATE(o:Tag $tag);`
            tag.id = uuidv4()

            await session.run(command, {tag: tag});
        })
    },
    read: async (tag) => {
        return dbCall(async(session) => {
            const result = await session.run(`MATCH (o:Tag {id: $id }) RETURN o;`, {id: tag.id});
            return result.records[0].get("o").properties;
        })
    },
    readAll: async () => {
        return dbCall(async(session) => {
            const result = await session.run(`MATCH (o:Tag) RETURN o;`);
            return result.records.map(record => record.get("o").properties);
        })
    },
    update: async (updated)=> {
        return dbCall(async (session) => {
            const command = "MATCH (o:Tag {id: $id }) \
                    SET o += $updated;"

            await session.run(command, {id: updated.id, updated: updated});
        })
    },
    delete: async (tag) => {
        return dbCall(async (session) => {
            const command = `MATCH (o:Tag {id: $id }) \
                    DETACH DELETE o;`

            await session.run(command, {id: tag.id});
        })
    }
  }
}

export default NewTagRepository