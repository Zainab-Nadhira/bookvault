import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Save, Download, Trash2, Target } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { jsPDF } from "jspdf";
const Settings = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState({ username: user?.username || '', email: user?.email || '' });
  const [password, setPassword] = useState('');
  const [goal, setGoalVal] = useState(user?.yearlyGoal || 50);
  const [saving, setSaving] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...profile };
      if (password) payload.password = password;
      const res = await api.put('/auth/me', payload);
      updateUser(res.data.data);
      setPassword('');
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const saveGoal = async () => {
    try {
      await api.put('/goals', { targetBooks: Number(goal), year: new Date().getFullYear() });
      await api.put('/auth/me', { yearlyGoal: Number(goal) });
      updateUser({ yearlyGoal: Number(goal) });
      toast.success('Reading goal updated');
    } catch {
      toast.error('Failed to update goal');
    }
  };

  const exportData = async () => {
  try {
    const res = await api.get('/books', { params: { limit: 5000 } });
    const books = res.data.data;

    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(20);
    doc.text("BookVault Library Report", 14, y);

    y += 10;
    doc.setFontSize(11);
    doc.text(`Exported on: ${new Date().toLocaleString()}`, 14, y);

    y += 12;

    books.forEach((book, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.text(`${index + 1}. ${book.title}`, 14, y);

      y += 6;
      doc.setFontSize(11);
      doc.text(`Author: ${book.author || "-"}`, 20, y);

      y += 6;
      doc.text(`Status: ${book.status || "-"}`, 20, y);

      y += 6;
      doc.text(`Pages: ${book.pages || 0}`, 20, y);

      y += 6;
      doc.text(`Current Page: ${book.currentPage || 0}`, 20, y);

      y += 6;
      doc.text(`Rating: ${book.rating || 0}/5`, 20, y);

      y += 6;
      doc.text(`Genre: ${book.genre || "-"}`, 20, y);

      y += 10;

      doc.line(14, y - 2, 196, y - 2);

      y += 6;
    });

    doc.save("BookVault_Library_Report.pdf");

    toast.success("Library exported as PDF");
  } catch {
    toast.error("Export failed");
  }
};

  const deleteAccount = async () => {
    if (!window.confirm('This will permanently delete your account and all your books. Continue?')) return;
    try {
      await api.delete('/auth/me');
      toast.success('Account deleted');
      logout();
    } catch {
      toast.error('Failed to delete account');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-3xl font-bold text-stone-800 dark:text-stone-100">Settings</h1>

      <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={saveProfile} className="glass-card space-y-4">
        <h3 className="font-display font-semibold text-lg">Profile</h3>
        <input
          className="input-field"
          placeholder="Username"
          value={profile.username}
          onChange={(e) => setProfile({ ...profile, username: e.target.value })}
        />
        <input
          className="input-field"
          placeholder="Email"
          type="email"
          value={profile.email}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
        />
        <input
          className="input-field"
          placeholder="New password (leave blank to keep current)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={saving} className="btn-primary">
          <Save size={16} /> {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </motion.form>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card space-y-4">
        <h3 className="font-display font-semibold text-lg">Appearance</h3>
        <div className="flex gap-2">
          {['light', 'dark', 'system'].map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                theme === t ? 'bg-primary text-white shadow-soft' : 'bg-accent/40 dark:bg-white/10 text-stone-600 dark:text-stone-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card space-y-4">
        <h3 className="font-display font-semibold text-lg flex items-center gap-2">
          <Target size={18} /> Yearly Reading Goal
        </h3>
        <div className="flex gap-3">
          <input
            type="number"
            min="1"
            className="input-field"
            value={goal}
            onChange={(e) => setGoalVal(e.target.value)}
          />
          <button onClick={saveGoal} className="btn-primary flex-shrink-0">
            Save Goal
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card space-y-4">
        <h3 className="font-display font-semibold text-lg">Data</h3>
        <button onClick={exportData} className="btn-secondary">
          <Download size={16} /> Export Library (PDF)
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card space-y-4 border border-red-200 dark:border-red-500/20">
        <h3 className="font-display font-semibold text-lg text-red-500">Danger Zone</h3>
        <button onClick={deleteAccount} className="btn-secondary text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
          <Trash2 size={16} /> Delete Account
        </button>
      </motion.div>
    </div>
  );
};

export default Settings;
