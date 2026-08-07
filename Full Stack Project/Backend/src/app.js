import express from "express"
//import router from './routers/authRoutes.js';
import cors from "cors"
import authRoutes from "./routers/authRoutes.js"
import taskRoutes from "./routers/taskRoutes.js"
import notFound from "./middleware/notfound.js";
import errorHandler from "./middleware/errorHandler.js";

const app=express();

app.use(cors()); //allow the frontend (different origin/port) to call this API
app.use(express.json()); //for parsing application/json

//Middleware
app.use("/api/auth", authRoutes); //auth routes
app.use("/api/tasks", taskRoutes);

app.use(notFound); //no matching -> build a 404 error
app.use(errorHandler); //central error handler

//app.use(express.json())
//app.use("/",router)

//app.get("/", (req, res) => {
//    res.send("Server OK");
//});

export default app;