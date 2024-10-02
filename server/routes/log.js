const { client, executeTransaction, ObjectId } = require('../db/mongo');
const express = require("express")
const router = express.Router();
const { UserSessions } = require("../common/session")

const logdb = client.db("logs")

router.post("/push", async(req,res,next) => {

    res.status(202).send('Log recieved successfully')

    const log = {
        reqHeaders: req.headers,
        ...req.body.log ,
        timestamp: new Date()
    }

    if(req.isAuthenticated) {
        log.email = UserSessions.sessionTokens[req.sessionToken]
    }

    const inserted = await executeTransaction( async () => {
        return logdb.collection('performance').insertOne(log)
    }, res)

    console.log(inserted)

})

router.post("/search", () => {})

module.exports = router