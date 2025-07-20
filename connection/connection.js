const mongoose = require("mongoose");

async function connectMongoDb(url) {
    console.log(url)
    return mongoose.connect(url).then(() => {
        console.log("database connected!")
      }).catch(() => {
          console.log("some error came!") ; 
      })
}

module.exports = {
    connectMongoDb
}