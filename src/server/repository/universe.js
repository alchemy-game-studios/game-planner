import { v4 as uuidv4 } from 'uuid'

const NewuniverseRepository = function(driver) {   
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
    create: async (universe) => {
        return dbCall(async (session) => {
            const command = `CREATE(o:Universe $universe);`
            universe.id = uuidv4()

            await session.run(command, {universe: universe});
        })
    },
    read: async (universe) => {
        return dbCall(async(session) => {
            const result = await session.run(`MATCH (o:Universe {id: $id }) RETURN o;`, {id: universe.id});
            return result.records[0].get("o").properties;
        })
    },
    readAll: async () => {
        return dbCall(async(session) => {
            const result = await session.run(`MATCH (o:Universe) RETURN o;`);
            return result.records.map(record => record.get("o").properties);
        })
    },
    update: async (updated)=> {
        return dbCall(async (session) => {
            const command = "MATCH (o:Universe {id: $id }) \
                    SET o += $updated;"

            await session.run(command, {id: updated.id, updated: updated});
        })
    },
    delete: async (universe) => {
        return dbCall(async (session) => {
            const command = `MATCH (o:Universe {id: $id }) \
                    DETACH DELETE o;`

            await session.run(command, {id: universe.id});
        })
    }
  }
}

export default NewuniverseRepository