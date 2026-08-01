import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../services/api';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = ['#6D4C41', '#8D6E63', '#A1887F', '#BCAAA4', '#D7CCC8', '#EFEBE9', '#4E342E', '#3E2723'];

const Statistics = () => {
  const [monthly, setMonthly] = useState([]);
  const [genres, setGenres] = useState([]);
  const [heatmap, setHeatmap] = useState({});
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [m, g, h, d] = await Promise.all([
        api.get('/stats/monthly'),
        api.get('/stats/genres'),
        api.get('/stats/heatmap'),
        api.get('/stats/dashboard'),
      ]);
      setMonthly(m.data.data.map((x) => ({ month: MONTH_LABELS[x.month - 1], books: x.books, pages: x.pages })));
      setGenres(g.data.data);
      const map = {};
      h.data.data.forEach((entry) => (map[entry.date] = entry.pages));
      setHeatmap(map);
      setDashboard(d.data.data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="skeleton h-96 rounded-xl2" />;

  // Build a simple 26-week heatmap grid ending today
  const today = new Date();
  const days = [];
  for (let i = 181; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, pages: heatmap[key] || 0 });
  }
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const heatColor = (pages) => {
    if (pages === 0) return 'bg-accent/30 dark:bg-white/5';
    if (pages < 15) return 'bg-primary/30';
    if (pages < 40) return 'bg-primary/55';
    if (pages < 80) return 'bg-primary/80';
    return 'bg-primary';
  };

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold text-stone-800 dark:text-stone-100">Reading Statistics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ['Books Completed', dashboard.booksRead],
          ['Pages Read', dashboard.pagesRead],
          ['Average Rating', `${dashboard.averageRating} / 5`],
          ['Current Streak', `${dashboard.streak?.current || 0} days`],
        ].map(([label, val]) => (
          <div key={label} className="glass-card text-center">
            <p className="text-2xl font-bold font-display text-primary dark:text-accent">{val}</p>
            <p className="text-sm text-stone-500 dark:text-stone-400">{label}</p>
          </div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card">
        <h3 className="font-display font-semibold text-lg mb-4">Reading Activity (last ~26 weeks)</h3>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.key}
                  title={`${day.key}: ${day.pages} pages`}
                  className={`w-3 h-3 rounded-sm ${heatColor(day.pages)}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-stone-400">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-accent/30 dark:bg-white/5" />
          <div className="w-3 h-3 rounded-sm bg-primary/30" />
          <div className="w-3 h-3 rounded-sm bg-primary/55" />
          <div className="w-3 h-3 rounded-sm bg-primary/80" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span>More</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card">
          <h3 className="font-display font-semibold text-lg mb-4">Books Finished Per Month</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthly}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#A1887F" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#A1887F" />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              <Bar dataKey="books" fill="#6D4C41" radius={[6, 6, 0, 0]} animationDuration={900} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card">
          <h3 className="font-display font-semibold text-lg mb-4">Pages Read Per Month</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthly}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#A1887F" />
              <YAxis tick={{ fontSize: 12 }} stroke="#A1887F" />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              <Line type="monotone" dataKey="pages" stroke="#6D4C41" strokeWidth={3} dot={{ r: 3 }} animationDuration={900} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card lg:col-span-2">
          <h3 className="font-display font-semibold text-lg mb-4">Genre Breakdown</h3>
          {genres.length === 0 ? (
            <p className="text-stone-500 text-sm">Finish some books to see your genre breakdown.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={genres} dataKey="count" nameKey="genre" outerRadius={100} animationDuration={900} label>
                  {genres.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Statistics;
