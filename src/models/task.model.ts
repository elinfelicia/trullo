import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
    title: string;
    description: string;
    status: string;
    assignedTo: mongoose.Types.ObjectId;
    createdAt: Date;
    finishedBy: Date;
}

const taskSchema: Schema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    status: {type: String, required: true, enum: ["To Do", "In Progress", "Blocked", "Done"]},
    assignedTo: {type: Schema.Types.ObjectId, ref: "User", required: true},
    createdAt: {type: Date, default: Date.now, required: true},
    finishedBy: {type: Date}
});

export default mongoose.model<ITask>("Task", taskSchema);