const path = require('path')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const credentials = path.normalize(
        __dirname+'/../ssl/mongodb_atlas/X509-cert-8376828078522052159.pem'
)

const client = new MongoClient('mongodb+srv://dbspace.26sm1sl.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&appName=dbspace', {
  tlsCertificateKeyFile: credentials,
  serverApi: ServerApiVersion.v1
});

async function run() {
  
  try {
    await client.connect();
    console.log("connected to MongoDB Atlas")
  } catch (error) {
    console.log(error)
    return
  }

}

async function executeTransaction(transaction,res,options={}) {

  const session = client.startSession();
  
  const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'local' },
    writeConcern: { w: 'majority' },
    ...options
  };
  
  var result
  try {
    result = await session.withTransaction(transaction, transactionOptions);
  } catch(error) {
    if([11000].includes(error.code)) {
      // Handling unique constraint error
      throw error
    }
    console.log('mongodb error',error.code,error.keyValue,error.keyPattern,error.index,error.errorResponse
      ,error
    )
    res.status(500).send({ message: "Database transaction aborted." })
    return false
  } finally {
    await session.endSession();
  }
  return result
}

run();
 
const maindb = client.db("main");

module.exports = { maindb , executeTransaction , ObjectId }