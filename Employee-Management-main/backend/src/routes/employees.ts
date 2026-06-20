import { Router, type IRouter } from "express";
import { Employee } from "../models/employee";
import {
  CreateEmployeeBody,
  UpdateEmployeeBody,
  GetEmployeeParams,
  UpdateEmployeeParams,
  DeleteEmployeeParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toResponse(doc: InstanceType<typeof Employee>) {
  return {
    id: String(doc._id),
    employeeNo: doc.employeeNo,
    name: doc.name,
    designation: doc.designation,
    salary: doc.salary,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
  };
}

async function getNextEmployeeNo(): Promise<string> {
  const last = await Employee.findOne({}, { employeeNo: 1 })
    .sort({ createdAt: -1 })
    .lean();

  if (!last) return "EMP001";

  const lastNo = last.employeeNo ?? "";
  const match = lastNo.match(/\d+$/);
  if (!match) return "EMP001";

  const next = parseInt(match[0], 10) + 1;
  return `EMP${String(next).padStart(3, "0")}`;
}

router.get("/employees", async (req, res) => {
  const employees = await Employee.find().sort({ createdAt: -1 });
  res.json(employees.map(toResponse));
});

router.get("/employees/stats", async (_req, res) => {
  const all = await Employee.find().lean();
  const totalEmployees = all.length;
  const totalSalary = all.reduce((sum, e) => sum + e.salary, 0);
  const avgSalary = totalEmployees > 0 ? totalSalary / totalEmployees : 0;

  const designationMap: Record<string, number> = {};
  for (const e of all) {
    designationMap[e.designation] = (designationMap[e.designation] ?? 0) + 1;
  }

  const topDesignations = Object.entries(designationMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([designation, count]) => ({ designation, count }));

  res.json({ totalEmployees, totalSalary, avgSalary, topDesignations });
});

router.get("/employees/:id", async (req, res) => {
  const { id } = GetEmployeeParams.parse(req.params);
  const employee = await Employee.findById(id);
  if (!employee) {
    res.status(404).json({ error: "Employee not found" });
    return;
  }
  res.json(toResponse(employee));
});

router.post("/employees", async (req, res) => {
  const body = CreateEmployeeBody.parse(req.body);
  const employeeNo = (body.employeeNo && body.employeeNo.trim()) || (await getNextEmployeeNo());
  const employee = new Employee({ ...body, employeeNo });
  await employee.save();
  res.status(201).json(toResponse(employee));
});

router.put("/employees/:id", async (req, res) => {
  const { id } = UpdateEmployeeParams.parse(req.params);
  const body = UpdateEmployeeBody.parse(req.body);
  const employee = await Employee.findByIdAndUpdate(id, body, { new: true });
  if (!employee) {
    res.status(404).json({ error: "Employee not found" });
    return;
  }
  res.json(toResponse(employee));
});

router.delete("/employees/:id", async (req, res) => {
  const { id } = DeleteEmployeeParams.parse(req.params);
  const employee = await Employee.findByIdAndDelete(id);
  if (!employee) {
    res.status(404).json({ error: "Employee not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
