import mongoose, { Schema, Document } from "mongoose";

export interface IEmployee extends Document {
  employeeNo: string;
  name: string;
  designation: string;
  salary: number;
  createdAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    designation: { type: String, required: true },
    salary: { type: Number, required: true, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Employee =
  mongoose.models.Employee ||
  mongoose.model<IEmployee>("Employee", EmployeeSchema);
