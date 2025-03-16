import { v4 as uuidv4 } from 'uuid'

const NewplaceRepository = function(driver) {   
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
    create: async (place) => {
        return dbCall(async (session) => {
            const command = `CREATE(o:Place $place);`
            place.id = uuidv4()

            await session.run(command, {place: place});
        })
    },
    read: async (place) => {
        return dbCall(async(session) => {
            const result = await session.run(`MATCH (o:Place {id: $id }) RETURN o;`, {id: place.id});
            return result.records[0].get("o").properties;
        })
    },
    readAll: async () => {
        return dbCall(async(session) => {
            const result = await session.run(`MATCH (o:Place) RETURN o;`);
            return result.records.map(record => record.get("o").properties);
        })
    },
    update: async (updated)=> {
        return dbCall(async (session) => {
            const command = "MATCH (o:Place {id: $id }) \
                    SET o += $updated;"

            await session.run(command, {id: updated.id, updated: updated});
        })
    },
    delete: async (place) => {
        return dbCall(async (session) => {
            const command = `MATCH (o:Place {id: $id }) \
                    DETACH DELETE o;`

            await session.run(command, {id: place.id});
        })
    }
  }
}

export default NewplaceRepository