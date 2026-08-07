import app from "./src/app.js"
import dotenv from "dotenv"
import connectDB from "./src/db/db.js"
dotenv.config()

const PORT=process.env.PORT
connectDB();

app.listen(PORT,()=>{
    console.log(`Listening to ${PORT}`)
})