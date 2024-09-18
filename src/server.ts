import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./config/database";
import taskRoutes from "./routes/task.routes";
import userRoutes from "./routes/user.routes";


dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());


app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.get("/", (req: Request, res: Response) => {
    res.send("Trullo API");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});