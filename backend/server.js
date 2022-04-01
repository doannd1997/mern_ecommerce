const app = require('./app')

const dotenv = require('dotenv')
const connectDatabase = require('./config/database')

// handling uncautch exception
process.on("uncaughtException", err=>{
    console.log(`Error: ${err.message}`)
    console.log("Shutting Down Server Due To Uncautch Promise Rejection")
    process.exit(1)
})

// config
dotenv.config({path:'backend/config/config.env'})

// connect to Databse
connectDatabase()

const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server is listening on http://localhost:${process.env.PORT}`)
})

// unhandled promise rejection
process.on("unhandledRejection", err=>{
    console.log(`Error: ${err.message}`)
    console.log("Shutting Down Server Due To Unhandled Promise Rejection")
    server.close(()=>{
        process.exit(1)
    })
})