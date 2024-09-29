const path = require('path')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//  Authenticating to MongoDB
const client = 
  (process.env.HOST_ENV === 'azure')
  ?
    //  Credential authentication
    new MongoClient(process.env.MONGODB_CONNECT_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
      }
    })
  : 
    //  TLS certificate authentication
    new MongoClient('mongodb+srv://dbspace.sf733.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&appName=dbspace', {
      tlsCertificateKeyFile: path.normalize(
        __dirname+'/../ssl/mongodb_atlas/X509-cert.pem'
      ),
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
      }
    });

//  Establishes TLS connection with MongoDB
async function run() {
  
  try {
    await client.connect();
    console.log("connected to MongoDB Atlas")
  } catch (error) {
    //console.log(error)
    return
  }

}

//  Handles the MongoDB transaction execution logics
async function executeTransaction(transaction,res,options={}) {

  const session = client.startSession();
  
  //  Setting the mongos transaction settings
  const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'local' },
    writeConcern: { w: 'majority' },
    ...options
  };
  
  var result
  
  try {
    result = await session.withTransaction(transaction, transactionOptions);
  } 
  catch(error) {
    if([11000].includes(error.code)) {
        // Handling unique constraint error
      throw error
    }
    console.log('MongoDB transaction error ////\n',error)
    res.status(500).send({ message: "Database transaction aborted." })
    return false
  } 
  finally {
    await session.endSession();
  }

  return result
}

//  Connecting to MondoDB
run();
 
//  The 'main' database contains 'users' and 'articles' collections
const maindb = client.db("main");

module.exports = { maindb , executeTransaction , ObjectId }