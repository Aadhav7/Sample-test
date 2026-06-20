import { useState } from "react";
import {
  useListEmployees,
  useGetEmployeeStats,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  getListEmployeesQueryKey,
  getGetEmployeeStatsQueryKey,
  type Employee,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Edit2, Trash2, Users, Download } from "lucide-react";
import { EmployeeDialog } from "@/components/employee-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";

const DESIGNATION_COLORS: Record<string, string> = {
  "Software Engineer": "bg-blue-100 text-blue-700 border-blue-200",
  "Senior Software Engineer": "bg-blue-100 text-blue-800 border-blue-300",
  "UI/UX Designer": "bg-purple-100 text-purple-700 border-purple-200",
  "Project Manager": "bg-amber-100 text-amber-700 border-amber-200",
  "QA Engineer": "bg-green-100 text-green-700 border-green-200",
  "DevOps Engineer": "bg-orange-100 text-orange-700 border-orange-200",
  "HR Manager": "bg-pink-100 text-pink-700 border-pink-200",
  "Data Analyst": "bg-teal-100 text-teal-700 border-teal-200",
  "Product Manager": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "Business Analyst": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "Team Lead": "bg-violet-100 text-violet-700 border-violet-200",
};

function getDesignationStyle(d: string) {
  return DESIGNATION_COLORS[d] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

const AVATAR_COLORS = ["bg-blue-500","bg-purple-500","bg-amber-500","bg-green-500","bg-rose-500","bg-teal-500","bg-indigo-500","bg-orange-500"];
function getAvatarColor(name: string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }
function getInitials(name: string) { return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2); }
const formatCurrency = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

function exportCSV(employees: Employee[]) {
  const header = ["Employee No", "Name", "Designation", "Salary", "Created At"];
  const rows = employees.map((e) => [
    e.employeeNo,
    e.name,
    e.designation,
    e.salary,
    new Date(e.createdAt).toLocaleDateString(),
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "teceze-employees.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Employees() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [designationFilter, setDesignationFilter] = useState("all");

  const queryClient = useQueryClient();
  const { data: employees, isLoading } = useListEmployees();
  const { data: stats } = useGetEmployeeStats();

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const designations = Array.from(new Set(employees?.map((e) => e.designation) ?? [])).sort();

  const filtered = employees?.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeNo.toLowerCase().includes(search.toLowerCase()) ||
      emp.designation.toLowerCase().includes(search.toLowerCase());
    const matchFilter = designationFilter === "all" || emp.designation === designationFilter;
    return matchSearch && matchFilter;
  });

  const handleAdd = () => { setSelectedEmployee(null); setDialogOpen(true); };
  const handleEdit = (emp: Employee) => { setSelectedEmployee(emp); setDialogOpen(true); };
  const handleDelete = (emp: Employee) => { setSelectedEmployee(emp); setDeleteDialogOpen(true); };

  const onSave = async (data: any) => {
    try {
      if (selectedEmployee) {
        await updateMutation.mutateAsync({ id: selectedEmployee.id, data });
      } else {
        await createMutation.mutateAsync({ data });
      }
      queryClient.invalidateQueries({ queryKey: getListEmployeesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetEmployeeStatsQueryKey() });
      setDialogOpen(false);
    } catch (error) { console.error(error); }
  };

  const onConfirmDelete = async () => {
    if (!selectedEmployee) return;
    try {
      await deleteMutation.mutateAsync({ id: selectedEmployee.id });
      queryClient.invalidateQueries({ queryKey: getListEmployeesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetEmployeeStatsQueryKey() });
      setDeleteDialogOpen(false);
    } catch (error) { console.error(error); }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Employee Directory</h2>
          <p className="text-sm text-muted-foreground">
            {stats?.totalEmployees ?? 0} total employees across {designations.length} roles
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => employees && exportCSV(employees)}
            disabled={!employees?.length}
            className="neu-button px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
            title="Export to CSV"
          >
            <Download size={15} /> Export
          </button>
          <button
            onClick={handleAdd}
            className="neu-button-primary px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> Add Employee
          </button>
        </div>
      </div>

      {/* Quick stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats?.totalEmployees ?? 0, color: "text-blue-600" },
          { label: "Roles", value: designations.length, color: "text-purple-600" },
          { label: "Avg Salary", value: stats ? formatCurrency(stats.avgSalary) : "—", color: "text-amber-600" },
          { label: "Filtered", value: isLoading ? "…" : `${filtered?.length ?? 0} shown`, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="neu-extruded-sm rounded-xl p-3 flex flex-col">
            <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
            <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="neu-extruded rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
            <input
              type="text"
              placeholder="Search by name, employee no, or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full neu-input pl-9 h-11 text-sm"
            />
          </div>
          <select
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
            className="neu-input h-11 text-sm px-3 min-w-[180px]"
          >
            <option value="all">All Designations</option>
            {designations.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Mobile View: Cards (hidden on md and up) */}
        <div className="block md:hidden space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="neu-extruded-sm p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <Skeleton className="h-4 w-28 bg-muted" />
                    <Skeleton className="h-3 w-16 bg-muted" />
                  </div>
                </div>
                <div className="flex justify-between border-t border-black/5 pt-3">
                  <Skeleton className="h-4 w-16 bg-muted" />
                  <Skeleton className="h-4 w-16 bg-muted" />
                </div>
              </div>
            ))
          ) : filtered?.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
              <div className="w-16 h-16 neu-pressed rounded-2xl flex items-center justify-center">
                <Users size={28} className="opacity-30" />
              </div>
              <p className="text-sm font-medium">No employees found</p>
              <p className="text-xs">Try adjusting your search or filter</p>
            </div>
          ) : (
            filtered?.map((emp) => (
              <div key={emp.id} className="neu-extruded-sm p-4 rounded-xl space-y-3 relative hover:bg-white/10 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(emp.name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {getInitials(emp.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-foreground leading-snug truncate">{emp.name}</h3>
                      <p className="text-xs text-muted-foreground leading-tight mt-0.5 truncate">{emp.designation}</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground neu-pressed-sm px-2 py-0.5 rounded-md shrink-0">
                    {emp.employeeNo}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-black/5 pt-2.5 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Salary</span>
                    <span className="font-bold text-foreground text-sm">{formatCurrency(emp.salary)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Joined</span>
                    <span className="text-foreground font-medium">
                      {new Date(emp.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2.5 border-t border-black/5">
                  <button
                    onClick={() => handleEdit(emp)}
                    className="neu-button px-3.5 py-1.5 rounded-lg text-primary text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(emp)}
                    className="neu-button px-3.5 py-1.5 rounded-lg text-destructive text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table (hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-muted-foreground text-[11px] uppercase tracking-wider border-b border-black/5">
                <th className="py-3 px-3 font-semibold">Employee</th>
                <th className="py-3 px-3 font-semibold">ID</th>
                <th className="py-3 px-3 font-semibold">Role</th>
                <th className="py-3 px-3 font-semibold">Salary</th>
                <th className="py-3 px-3 font-semibold">Joined</th>
                <th className="py-3 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-black/5">
                    <td className="py-4 px-3"><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-full bg-muted" /><Skeleton className="h-4 w-28 bg-muted" /></div></td>
                    <td className="py-4 px-3"><Skeleton className="h-4 w-16 bg-muted" /></td>
                    <td className="py-4 px-3"><Skeleton className="h-5 w-28 rounded-full bg-muted" /></td>
                    <td className="py-4 px-3"><Skeleton className="h-4 w-20 bg-muted" /></td>
                    <td className="py-4 px-3"><Skeleton className="h-4 w-20 bg-muted" /></td>
                    <td className="py-4 px-3"><Skeleton className="h-8 w-16 ml-auto bg-muted" /></td>
                  </tr>
                ))
              ) : filtered?.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="w-16 h-16 neu-pressed rounded-2xl flex items-center justify-center">
                        <Users size={28} className="opacity-30" />
                      </div>
                      <p className="text-sm font-medium">No employees found</p>
                      <p className="text-xs">Try adjusting your search or filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered?.map((emp) => (
                  <tr key={emp.id} className="border-b border-black/5 hover:bg-white/20 transition-colors group">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${getAvatarColor(emp.name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {getInitials(emp.name)}
                        </div>
                        <span className="font-semibold text-sm text-foreground">{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-mono text-xs text-muted-foreground neu-pressed-sm px-2 py-1 rounded-lg">{emp.employeeNo}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDesignationStyle(emp.designation)}`}>
                        {emp.designation}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-sm text-foreground">{formatCurrency(emp.salary)}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-xs text-muted-foreground">
                        {new Date(emp.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(emp)} className="w-8 h-8 rounded-lg neu-button flex items-center justify-center text-primary opacity-60 hover:opacity-100 transition-opacity" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(emp)} className="w-8 h-8 rounded-lg neu-button flex items-center justify-center text-destructive opacity-60 hover:opacity-100 transition-opacity" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && filtered && filtered.length > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span>{filtered.length} of {employees?.length ?? 0} employees</span>
            <span>Last updated just now</span>
          </div>
        )}
      </div>

      <EmployeeDialog open={dialogOpen} onOpenChange={setDialogOpen} employee={selectedEmployee} onSave={onSave} isPending={createMutation.isPending || updateMutation.isPending} />
      <DeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={onConfirmDelete} isPending={deleteMutation.isPending} employeeName={selectedEmployee?.name} />
    </div>
  );
}
