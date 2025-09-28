
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Archive,
  FolderKanban,
  AlertCircle,
  MessageSquare,
  Calendar,
  RotateCcw,
  AlertTriangle,
  Activity } from
'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays, subDays, isAfter, addDays } from 'date-fns';

// Dummy Link component for demonstration if a specific router is not in scope
// In a Next.js project, you would import { default as Link } from 'next/link';
// Or if using react-router-dom: import { Link } from 'react-router-dom';
const Link = ({ children, to, className }) =>
<a href={to} className={className}>{children}</a>;


// Dummy function to create page URL, replace with actual routing logic if needed
const createPageUrl = (path) => {
  // This is a placeholder. In a real application, you might use:
  // - For Next.js: `/${path}` or `router.push('/Project', { query: { id: projectId } })`
  // - For React Router: `/path`
  return `/${path}`; // Example: "/Project?id=123"
};

const COLORS = {
  active: '#8B5CF6', // violet
  pending: '#F59E0B', // amber
  approved: '#10B981', // emerald
  archived: '#6B7280' // gray
};

export default function AnalyticsDashboard({ data, projects, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) =>
          <Card key={i} className="rounded-xl border border-[rgb(var(--border-dark))] bg-[rgb(var(--surface-light))]">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-[rgb(var(--surface-dark))] rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-[rgb(var(--surface-dark))] rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>);

  }

  // Calculate advanced metrics
  const getProjectsNearingExpiration = () => {
    const threeDaysFromNow = addDays(new Date(), 3);
    return projects.filter((p) =>
    (p.status === 'active' || p.status === 'pending') &&
    p.share_expires_at &&
    isAfter(new Date(p.share_expires_at), new Date()) &&
    !isAfter(new Date(p.share_expires_at), threeDaysFromNow)
    );
  };

  const getAverageTimeToApproval = () => {
    const approvedProjects = projects.filter((p) => p.status === 'approved' && p.last_status_change_at);
    if (approvedProjects.length === 0) return 0;

    const totalDays = approvedProjects.reduce((sum, project) => {
      const approvalDate = new Date(project.last_status_change_at);
      const creationDate = new Date(project.created_date);
      return sum + differenceInDays(approvalDate, creationDate);
    }, 0);

    return Math.round(totalDays / approvedProjects.length);
  };

  const getRecentActivity = () => {
    const last7Days = subDays(new Date(), 7);
    return projects.filter((p) => new Date(p.created_date) > last7Days).length;
  };

  const getProjectTrend = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const count = projects.filter((p) => {
        const createdDate = new Date(p.created_date);
        return createdDate.toDateString() === date.toDateString();
      }).length;

      return {
        date: format(date, 'MMM dd'),
        projects: count,
        fullDate: date
      };
    });

    // Group by week for cleaner visualization
    const weeklyData = [];
    for (let i = 0; i < last30Days.length; i += 7) {
      const weekData = last30Days.slice(i, i + 7);
      const weekTotal = weekData.reduce((sum, day) => sum + day.projects, 0);
      if (weekData.length > 0) {// Ensure there's data for the week to format
        weeklyData.push({
          week: format(weekData[0].fullDate, 'MMM dd'),
          projects: weekTotal
        });
      }
    }

    return weeklyData;
  };

  const expiringProjects = getProjectsNearingExpiration();
  const avgTimeToApproval = getAverageTimeToApproval();
  const recentActivity = getRecentActivity();
  const projectTrend = getProjectTrend();

  const pieData = [
  { name: 'Active', value: data.active, color: COLORS.active },
  { name: 'Pending', value: data.pending, color: COLORS.pending },
  { name: 'Approved', value: data.approved, color: COLORS.approved },
  { name: 'Archived', value: data.archived, color: COLORS.archived }].
  filter((item) => item.value > 0);

  const workflowData = [
  { name: 'Active', count: data.active, color: COLORS.active },
  { name: 'Pending', count: data.pending, color: COLORS.pending },
  { name: 'Approved', count: data.approved, color: COLORS.approved }];


  const primaryStats = [
  {
    title: 'Total Projects',
    value: data.total,
    icon: FolderKanban,
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/30'
  },
  {
    title: 'Active Reviews',
    value: data.active,
    icon: TrendingUp,
    color: 'text-violet-400',
    bgColor: 'bg-violet-900/30'
  },
  {
    title: 'Pending Changes',
    value: data.pending,
    icon: AlertCircle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/30'
  },
  {
    title: 'Ready to Archive',
    value: data.approved,
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-900/30'
  }];


  const insightStats = [
  {
    title: 'Links Expiring Soon',
    value: expiringProjects.length,
    icon: AlertTriangle,
    color: expiringProjects.length > 0 ? 'text-red-400' : 'text-gray-400',
    bgColor: expiringProjects.length > 0 ? 'bg-red-900/30' : 'bg-gray-900/30',
    subtitle: 'Next 3 days'
  },
  {
    title: 'Avg. Time to Approval',
    value: avgTimeToApproval,
    icon: Clock,
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/30',
    subtitle: avgTimeToApproval === 1 ? 'day' : 'days',
    showUnit: true
  },
  {
    title: 'New This Week',
    value: recentActivity,
    icon: Activity,
    color: 'text-green-400',
    bgColor: 'bg-green-900/30',
    subtitle: 'projects created'
  },
  {
    title: 'Archived Projects',
    value: data.archived,
    icon: Archive,
    color: 'text-gray-400',
    bgColor: 'bg-gray-900/30',
    subtitle: 'total archived'
  }];


  return (
    <div className="space-y-8">
      {/* Primary Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Project Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {primaryStats.map((stat, index) =>
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}>

              <Card className="rounded-xl border border-[rgb(var(--border-dark))] bg-[rgb(var(--surface-light))] h-[120px]">
                <CardContent className="bg-slate-900 text-stone-50 p-6 h-full flex items-center">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-white mt-2">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Workflow Insights */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Workflow Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {insightStats.map((stat, index) =>
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}>

              <Card className="rounded-xl border border-[rgb(var(--border-dark))] bg-[rgb(var(--surface-light))] h-[120px]">
                <CardContent className="bg-slate-900 text-stone-50 p-6 h-full flex items-center">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">
                        {stat.title}
                      </p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <p className="text-3xl font-bold text-white">
                          {stat.value}
                        </p>
                        {stat.showUnit &&
                      <span className="text-sm text-[rgb(var(--text-secondary))]">
                            {stat.subtitle}
                          </span>
                      }
                      </div>
                      {stat.subtitle && !stat.showUnit &&
                    <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">
                          {stat.subtitle}
                        </p>
                    }
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Charts and Expiring Projects */}
      {data.total > 0 &&
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Project Status Distribution */}
          <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}>

            <Card className="rounded-xl border border-[rgb(var(--border-dark))] bg-[rgb(var(--surface-light))]">
              <CardHeader className="bg-slate-900 p-6 flex flex-col space-y-1.5">
                <CardTitle className="text-lg text-white">Project Status Distribution</CardTitle>
              </CardHeader>
              <CardContent className="bg-slate-900 pt-0 p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value">

                        {pieData.map((entry, index) =>
                      <Cell key={`cell-${index}`} fill={entry.color} />
                      )}
                      </Pie>
                      <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgb(31, 41, 55)',
                        border: '1px solid rgb(55, 65, 81)',
                        borderRadius: '8px',
                        color: 'white'
                      }} />

                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  {pieData.map((entry) =>
                <div key={entry.name} className="flex items-center gap-2">
                      <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }} />

                      <span className="text-stone-50 text-sm">
                        {entry.name} ({entry.value})
                      </span>
                    </div>
                )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Expiring Projects */}
          <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0 }}>

            <Card className="rounded-xl border border-[rgb(var(--border-dark))] bg-[rgb(var(--surface-light))]">
              <CardHeader className="bg-slate-900 p-6 flex flex-col space-y-1.5">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Links Expiring Soon
                </CardTitle>
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  {expiringProjects.length} project{expiringProjects.length !== 1 ? 's' : ''} expiring in next 3 days
                </p>
              </CardHeader>
              <CardContent className="bg-slate-900 pt-0 p-6">
                <div className="h-64 overflow-y-auto">
                  {expiringProjects.length > 0 ?
                <div className="space-y-3">
                      {expiringProjects.map((project) =>
                  <div key={project.id} className="p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-red-200 font-medium truncate">
                                {project.name}
                              </h4>
                              {project.client_display_name &&
                        <p className="text-xs text-red-400 mt-1">
                                  Client: {project.client_display_name}
                                </p>
                        }
                              {project.share_expires_at &&
                        <p className="text-xs text-red-300 mt-1">
                                  Expires: {format(new Date(project.share_expires_at), 'MMM dd, yyyy \'at\' h:mm a')}
                                </p>
                        }
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <Link
                          to={createPageUrl(`Project?id=${project.id}`)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md transition-colors text-center">

                                Extend Link
                              </Link>
                              <Badge variant="outline" className="text-red-300 border-red-500/50 text-xs">
                                {project.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                  )}
                    </div> :

                <div className="h-full flex items-center justify-center text-center">
                      <div>
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
                        <p className="text-green-300 font-medium">All Links Are Fresh</p>
                        <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                          No projects have expiring links in the next 3 days
                        </p>
                      </div>
                    </div>
                }
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      }

      {/* Project Creation Trend - Full Width */}
      {data.total > 0 &&
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}>

          <Card className="rounded-xl border border-[rgb(var(--border-dark))] bg-[rgb(var(--surface-light))]">
            <CardHeader className="bg-slate-900 p-6 flex flex-col space-y-1.5">
              <CardTitle className="text-lg text-white">Project Creation Trend</CardTitle>
              <p className="text-sm text-[rgb(var(--text-secondary))]">Last 4 weeks</p>
            </CardHeader>
            <CardContent className="bg-slate-900 pt-0 p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(55, 65, 81)" />
                    <XAxis
                    dataKey="week"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgb(156, 163, 175)', fontSize: 12 }} />

                    <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgb(156, 163, 175)', fontSize: 12 }} />

                    <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(31, 41, 55)',
                      border: '1px solid rgb(55, 65, 81)',
                      borderRadius: '8px',
                      color: 'white'
                    }} />

                    <Line
                    type="monotone"
                    dataKey="projects"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2, fill: 'white' }} />

                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      }
    </div>);

}