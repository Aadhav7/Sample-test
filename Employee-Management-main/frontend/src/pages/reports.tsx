import { useMemo } from "react";
import { useListEmployees, useGetEmployeeStats, type Employee } from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, DollarSign, Award, Download } from "lucide-react";

const PIE_COLORS = ["#3b82f6","#8b5cf6","#f59e0b","#10b981","#ef4444","#f97316","#06b6d4","#ec4899"];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const AVATAR_COLORS = ["bg-blue-500","bg-purple-500","bg-amber-500","bg-green-500","bg-rose-500","bg-teal-500","bg-indigo-500","bg-orange-500"];
function getAvatarColor(name: string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }
function getInitials(name: string) { return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2); }

function exportReport(employees: Employee[]) {
  const designationMap: Record<string, { count: number; totalSalary: number }> = {};
  employees.forEach((e) => {
    if (!designationMap[e.designation]) designationMap[e.designation] = { count: 0, totalSalary: 0 };
    designationMap[e.designation].count += 1;
    designationMap[e.designation].totalSalary += e.salary;
  });
  const rows = [
    ["Designation", "Headcount", "Total Salary", "Avg Salary"],
    ...Object.entries(designationMap).map(([d, s]) => [d, s.count, s.totalSalary, Math.round(s.totalSalary / s.count)]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "teceze-report.csv"; a.click();
  URL.revokeObjectURL(url);
}

const CustomTooltip = ({ active, payload, label, isCurrency }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background neu-extruded-sm rounded-xl p-3 text-xs">
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{isCurrency ? formatCurrency(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function Reports() {
  const { data: employees, isLoading: empLoading } = useListEmployees();
  const { data: stats, isLoading: statsLoading } = useGetEmployeeStats();

  const designationStats = useMemo(() => {
    if (!employees) return [];
    const map: Record<string, { count: number; totalSalary: number }> = {};
    employees.forEach((emp) => {
      if (!map[emp.designation]) map[emp.designation] = { count: 0, totalSalary: 0 };
      map[emp.designation].count += 1;
      map[emp.designation].totalSalary += emp.salary;
    });
    return Object.entries(map)
      .map(([designation, { count, totalSalary }]) => ({ designation, count, avgSalary: Math.round(totalSalary / count), totalSalary }))
      .sort((a, b) => b.count - a.count);
  }, [employees]);

  const salaryRanges = useMemo(() => {
    if (!employees) return [];
    return [
      { range: "< $60K", min: 0, max: 60000 },
      { range: "$60K–$80K", min: 60000, max: 80000 },
      { range: "$80K–$100K", min: 80000, max: 100000 },
      { range: "$100K+", min: 100000, max: Infinity },
    ].map((r) => ({ range: r.range, count: employees.filter((e) => e.salary >= r.min && e.salary < r.max).length }));
  }, [employees]);

  const topEarners = useMemo(() => {
    if (!employees) return [];
    return [...employees].sort((a, b) => b.salary - a.salary).slice(0, 5);
  }, [employees]);

  const isLoading = empLoading || statsLoading;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Workforce Analytics</h2>
          <p className="text-sm text-muted-foreground">Salary & headcount insights across all roles</p>
        </div>
        <button
          onClick={() => employees && exportReport(employees)}
          disabled={!employees?.length}
          className="neu-button px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 text-muted-foreground hover:text-foreground disabled:opacity-40 self-start"
        >
          <Download size={15} /> Export Report
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Employees", icon: Users, color: "text-blue-600", bg: "bg-blue-50", value: isLoading ? null : stats?.totalEmployees },
          { label: "Total Payroll", icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50", value: isLoading ? null : formatCurrency(stats?.totalSalary ?? 0) },
          { label: "Avg Salary", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50", value: isLoading ? null : formatCurrency(stats?.avgSalary ?? 0) },
          { label: "Unique Roles", icon: Award, color: "text-green-600", bg: "bg-green-50", value: isLoading ? null : designationStats.length },
        ].map((card) => (
          <div key={card.label} className="neu-extruded rounded-2xl p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
              <card.icon size={20} className={card.color} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
              {card.value === null ? <Skeleton className="h-6 w-20 bg-muted mt-1" /> : <p className="text-xl font-bold text-foreground">{card.value}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="neu-extruded rounded-2xl p-6">
          <h2 className="text-sm font-bold text-foreground mb-0.5">Headcount by Role</h2>
          <p className="text-xs text-muted-foreground mb-4">Number of employees per designation</p>
          {isLoading ? <Skeleton className="h-52 w-full rounded-xl bg-muted" /> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={designationStats} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="designation" width={105} tick={{ fontSize: 10 }} tickFormatter={(v) => v.length > 13 ? v.slice(0, 12) + "…" : v} />
                <Tooltip content={<CustomTooltip isCurrency={false} />} />
                <Bar dataKey="count" name="Employees" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="neu-extruded rounded-2xl p-6">
          <h2 className="text-sm font-bold text-foreground mb-0.5">Avg Salary by Role</h2>
          <p className="text-xs text-muted-foreground mb-4">Average annual compensation per designation</p>
          {isLoading ? <Skeleton className="h-52 w-full rounded-xl bg-muted" /> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={designationStats} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="designation" width={105} tick={{ fontSize: 10 }} tickFormatter={(v) => v.length > 13 ? v.slice(0, 12) + "…" : v} />
                <Tooltip content={<CustomTooltip isCurrency={true} />} />
                <Bar dataKey="avgSalary" name="Avg Salary" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="neu-extruded rounded-2xl p-6">
          <h2 className="text-sm font-bold text-foreground mb-0.5">Workforce Distribution</h2>
          <p className="text-xs text-muted-foreground mb-4">Team composition by role</p>
          {isLoading ? <Skeleton className="h-52 w-full rounded-xl bg-muted" /> : designationStats.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={designationStats} dataKey="count" nameKey="designation" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {designationStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any, name: any) => [`${v} employees`, name]} contentStyle={{ background: "hsl(214 32% 91%)", border: "none", borderRadius: 12, fontSize: 11 }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 10 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="neu-extruded rounded-2xl p-6">
          <h2 className="text-sm font-bold text-foreground mb-0.5">Salary Distribution</h2>
          <p className="text-xs text-muted-foreground mb-4">Employees grouped by salary range</p>
          {isLoading ? <Skeleton className="h-52 w-full rounded-xl bg-muted" /> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={salaryRanges} margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip isCurrency={false} />} />
                <Bar dataKey="count" name="Employees" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top earners */}
      <div className="neu-extruded rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-foreground">Top Earners</h2>
            <p className="text-xs text-muted-foreground">Highest compensated employees</p>
          </div>
          <span className="neu-pressed-sm px-3 py-1 rounded-lg text-xs text-muted-foreground font-medium">Top 5</span>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full bg-muted" />
                <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-32 bg-muted" /><Skeleton className="h-3 w-24 bg-muted" /></div>
                <Skeleton className="h-4 w-16 bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {topEarners.map((emp, i) => (
              <div key={emp.id} className="neu-extruded-sm rounded-xl p-4 flex flex-col items-center text-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                <div className={`w-10 h-10 rounded-full ${getAvatarColor(emp.name)} flex items-center justify-center text-white text-sm font-bold`}>
                  {getInitials(emp.name)}
                </div>
                <div>
                  <p className="font-semibold text-xs text-foreground leading-tight">{emp.name}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{emp.designation}</p>
                </div>
                <p className="font-bold text-sm text-primary">{formatCurrency(emp.salary)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
