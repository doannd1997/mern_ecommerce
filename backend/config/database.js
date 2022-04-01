const mongoose = require('mongoose')

const connectDatabase = ()=>{
    mongoose.connect(process.env.DB_URI, 
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true
        })
        .then((data)=>{
            console.log(`MongoDB connected with server: ${data.connection.host}`)
        })
        // .catch((err)=>{
        //     console.log(`MongoDB connected fail: ${err}`)
        // })
}

module.exports = connectDatabase