import { useState } from "react";
import { Link } from "wouter";
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
import {
  Users,
  DollarSign,
  TrendingUp,
  Briefcase,
  Plus,
  ArrowRight,
  BarChart3,
  Edit2,
  Trash2,
} from "lucide-react";
import { EmployeeDialog } from "@/components/employee-dialog";
import { DeleteDialog } from "@/components/delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";

const AVATAR_COLORS = [
  "bg-blue-500","bg-purple-500","bg-amber-500","bg-green-500",
  "bg-rose-500","bg-teal-500","bg-indigo-500","bg-orange-500",
];
function getAvatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}
function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}
const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const ROLE_BAR_COLORS = ["bg-blue-500","bg-purple-500","bg-amber-500","bg-green-500","bg-rose-500"];

function StatCard({ title, value, icon, sub, accent }: {
  title: string; value: React.ReactNode; icon: React.ReactNode; sub?: string; accent: string;
}) {
  return (
    <div className="neu-extruded p-5 rounded-2xl flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl ${accent} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wide block">{title}</span>
        <div className="text-2xl font-bold mt-1 text-foreground leading-tight">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const queryClient = useQueryClient();
  const { data: employees, isLoading: empLoading } = useListEmployees();
  const { data: stats, isLoading: statsLoading } = useGetEmployeeStats();

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const recentEmployees = employees
    ? [...employees].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
    : [];

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
    } catch (error) {
      console.error(error);
    }
  };

  const onConfirmDelete = async () => {
    if (!selectedEmployee) return;
    try {
      await deleteMutation.mutateAsync({ id: selectedEmployee.id });
      queryClient.invalidateQueries({ queryKey: getListEmployeesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetEmployeeStatsQueryKey() });
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Welcome banner */}
      <div className="neu-extruded rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-4">
          <img src="/teceze-logo.png" alt="Teceze" className="h-10 w-auto hidden sm:block" />
          <div>
            <h2 className="font-bold text-foreground text-base">Welcome to Teceze Control Center</h2>
            <p className="text-sm text-muted-foreground">Manage your workforce efficiently · Digital Innovation & Excellence</p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="neu-button-primary px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm shrink-0"
        >
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={statsLoading ? <Skeleton className="h-7 w-12 bg-muted" /> : stats?.totalEmployees}
          icon={<Users className="text-blue-600" size={22} />}
          accent="bg-blue-50"
        />
        <StatCard
          title="Total Payroll"
          value={statsLoading ? <Skeleton className="h-7 w-28 bg-muted" /> : formatCurrency(stats?.totalSalary ?? 0)}
          icon={<DollarSign className="text-purple-600" size={22} />}
          accent="bg-purple-50"
          sub="Annual"
        />
        <StatCard
          title="Avg Salary"
          value={statsLoading ? <Skeleton className="h-7 w-24 bg-muted" /> : formatCurrency(stats?.avgSalary ?? 0)}
          icon={<TrendingUp className="text-amber-600" size={22} />}
          accent="bg-amber-50"
          sub="Per employee / year"
        />
        <StatCard
          title="Top Role"
          value={statsLoading ? <Skeleton className="h-7 w-32 bg-muted" /> : (stats?.topDesignations?.[0]?.designation ?? "—")}
          icon={<Briefcase className="text-green-600" size={22} />}
          accent="bg-green-50"
          sub={statsLoading ? "" : `${stats?.topDesignations?.[0]?.count ?? 0} employees`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Employees */}
        <div className="lg:col-span-2 neu-extruded rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-foreground">Recent Employees</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Latest additions to your team</p>
            </div>
            <Link
              href="/employees"
              className="text-xs text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>

          <div className="space-y-1">
            {empLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 px-3">
                    <Skeleton className="h-9 w-9 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-28 bg-muted" />
                      <Skeleton className="h-3 w-20 bg-muted" />
                    </div>
                    <Skeleton className="h-4 w-16 bg-muted" />
                  </div>
                ))
              : recentEmployees.length === 0
              ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No employees yet. Add your first one!
                </div>
              )
              : recentEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-white/20 transition-colors group"
                  >
                    <div className={`w-9 h-9 rounded-full ${getAvatarColor(emp.name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {getInitials(emp.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{emp.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{emp.designation}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground hidden sm:block">
                        {formatCurrency(emp.salary)}
                      </span>
                      <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-1">
                        <button onClick={() => handleEdit(emp)} className="w-7 h-7 rounded-lg neu-button flex items-center justify-center text-primary" title="Edit">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => handleDelete(emp)} className="w-7 h-7 rounded-lg neu-button flex items-center justify-center text-destructive" title="Delete">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="neu-extruded rounded-2xl p-6">
            <h2 className="text-base font-bold text-foreground mb-4">Role Distribution</h2>
            {statsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-24 bg-muted" />
                      <Skeleton className="h-3 w-6 bg-muted" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full bg-muted" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.topDesignations?.slice(0, 5).map((d, i) => {
                  const pct = stats.totalEmployees ? Math.round((d.count / stats.totalEmployees) * 100) : 0;
                  return (
                    <div key={d.designation}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-foreground font-medium truncate pr-2">{d.designation}</span>
                        <span className="text-muted-foreground shrink-0">{d.count} · {pct}%</span>
                      </div>
                      <div className="h-1.5 w-full neu-pressed rounded-full overflow-hidden">
                        <div className={`h-full ${ROLE_BAR_COLORS[i % ROLE_BAR_COLORS.length]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Link href="/reports">
            <div className="neu-extruded rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors group">
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <BarChart3 size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">Reports & Analytics</p>
                <p className="text-xs text-muted-foreground">Salary charts & insights</p>
              </div>
              <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>

          <Link href="/employees">
            <div className="neu-extruded rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors group">
              <div className="w-11 h-11 bg-green-500/10 rounded-xl flex items-center justify-center shrink-0">
                <Users size={20} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">Manage Employees</p>
                <p className="text-xs text-muted-foreground">Add, edit, search & filter</p>
              </div>
              <ArrowRight size={16} className="text-muted-foreground group-hover:text-green-600 transition-colors" />
            </div>
          </Link>
        </div>
      </div>

      <EmployeeDialog open={dialogOpen} onOpenChange={setDialogOpen} employee={selectedEmployee} onSave={onSave} isPending={createMutation.isPending || updateMutation.isPending} />
      <DeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={onConfirmDelete} isPending={deleteMutation.isPending} employeeName={selectedEmployee?.name} />
    </div>
  );
}
