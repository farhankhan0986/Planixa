import mongoose from "mongoose";

const SubtaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
});

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "in-review", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    labels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Label",
      },
    ],
    subtasks: [SubtaskSchema],
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Task ||
  mongoose.model("Task", TaskSchema);
