import mongoose, { Schema, Document, PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

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

taskSchema.plugin(mongoosePaginate);

interface TaskModel<T extends Document> extends PaginateModel<T> {}

const Task: TaskModel<ITask> = mongoose.model<ITask>("Task", taskSchema) as TaskModel<ITask>;

export default Task;