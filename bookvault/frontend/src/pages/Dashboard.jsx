import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookMarked, BookOpen, Bookmark, Heart, Flame, FileText, Star, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/StatCard';
import ProgressRing from '../components/ProgressRing';
import BookCard from '../components/BookCard';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = ['#6D4C41', '#8D6E63', '#A1887F', '#BCAAA4', '#D7CCC8', '#EFEBE9'];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [d, m, g] = await Promise.all([
          api.get('/stats/dashboard'),
          api.get('/stats/monthly'),
          api.get('/stats/genres'),
        ]);
        setStats(d.data.data);
        setMonthly(m.data.data.map((x) => ({ month: MONTH_LABELS[x.month - 1], books: x.books })));
        setGenres(g.data.data.slice(0, 6));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-xl2" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-stone-800 dark:text-stone-100">
            Welcome back, {user?.username} 📚
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1">{todayStr}</p>
        </div>
        <Link to="/books/new" className="btn-primary self-start sm:self-auto">
          <Plus size={18} /> Quick Add Book
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookMarked} label="Books Read" value={stats.booksRead} delay={0.0} />
        <StatCard icon={BookOpen} label="Currently Reading" value={stats.currentlyReading} delay={0.05} />
        <StatCard icon={Bookmark} label="Want to Read" value={stats.wantToRead} delay={0.1} />
        <StatCard icon={Heart} label="Favorites" value={stats.favorites} delay={0.15} />
        <StatCard icon={Flame} label="Reading Streak" value={stats.streak?.current || 0} suffix=" days" delay={0.2} />
        <StatCard icon={FileText} label="Pages Read" value={stats.pagesRead} delay={0.25} />
        <StatCard icon={BookMarked} label="Books This Month" value={stats.booksThisMonth} delay={0.3} />
        <StatCard icon={Star} label="Average Rating" value={stats.averageRating} suffix=" / 5" delay={0.35} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card flex flex-col items-center justify-center">
          <h3 className="font-display font-semibold text-lg mb-4 self-start">Yearly Reading Goal</h3>
          <ProgressRing percent={stats.goal.percent} label={`${stats.goal.completed} / ${stats.goal.target} books`} />
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-4 text-center">
            {stats.goal.remaining} books remaining
            {stats.goal.predictedCompletionDate && (
              <>
                <br />
                Predicted finish: {new Date(stats.goal.predictedCompletionDate).toLocaleDateString()}
              </>
            )}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card lg:col-span-2">
          <h3 className="font-display font-semibold text-lg mb-4">Books Finished Per Month</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#A1887F" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#A1887F" />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(109,76,65,0.15)' }} />
              <Bar dataKey="books" fill="#6D4C41" radius={[6, 6, 0, 0]} animationDuration={900} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {genres.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card">
          <h3 className="font-display font-semibold text-lg mb-4">Favorite Genres</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={genres} dataKey="count" nameKey="genre" innerRadius={60} outerRadius={90} animationDuration={900}>
                {genres.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      <div>
        <h3 className="font-display font-semibold text-lg mb-4">Recent Activity</h3>
        {stats.recentActivity.length === 0 ? (
          <p className="text-stone-500 dark:text-stone-400">No activity yet — add your first book!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {stats.recentActivity.map((b, i) => (
              <BookCard key={b._id} book={b} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
