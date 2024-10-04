const express = require("express")
const router = express.Router();
const { requestHandler , protectedRoute} = require("./middlewares")

router.post("/filter", requestHandler.filter)

router.post("/update", protectedRoute, requestHandler.update)

router.post("/search", requestHandler.search)

router.get(["/getOne/:id","/getById/:id","/:id","/getOne","/getById","/"], requestHandler.getById)

router.post(["/getOne/:id","/getById/:id","/:id"], requestHandler.getById)

router.post(["/getOne","/getById","/"], requestHandler.getById)

module.exports = router