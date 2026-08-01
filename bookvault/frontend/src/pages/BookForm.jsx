import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Save, ArrowLeft, Upload } from 'lucide-react';
import api from '../services/api';
import StarRating from '../components/StarRating';

const emptyBook = {
  title: '',
  author: '',
  publisher: '',
  isbn: '',
  genre: '',
  language: 'English',
  pages: '',
  currentPage: '',
  status: 'want-to-read',
  rating: 0,
  review: '',
  favoriteQuote: '',
  notes: '',
  tags: '',
  purchaseLink: '',
  price: '',
  format: 'Paperback',
  isWishlist: false,
  isFavorite: false,
  seriesName: '',
  seriesNumber: '',
};

const BookForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyBook);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/books/${id}`).then((res) => {
      const b = res.data.data;
      setForm({ ...b, tags: (b.tags || []).join(', ') });
      setCoverPreview(b.coverImage || '');
      setLoading(false);
    });
  }, [id, isEdit]);

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
  ...form,
  genre: form.genre
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase()),

  pages: Number(form.pages) || 0,
  currentPage: Number(form.currentPage) || 0,
  price: Number(form.price) || 0,
  seriesNumber: form.seriesNumber ? Number(form.seriesNumber) : null,
  tags: form.tags
    .toString()
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean),
};

      let bookId = id;
      if (isEdit) {
        await api.put(`/books/${id}`, payload);
      } else {
        const res = await api.post('/books', payload);
        bookId = res.data.data._id;
      }

      if (coverFile) {
        const fd = new FormData();
        fd.append('cover', coverFile);
        await api.post(`/books/${bookId}/cover`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      toast.success(isEdit ? 'Book updated!' : 'Book added to your vault!');
      navigate(`/books/${bookId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save book');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="skeleton h-96 rounded-xl2" />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-primary text-sm">
        <ArrowLeft size={16} /> Back
      </button>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="glass-card space-y-6"
      >
        <h1 className="font-display text-2xl font-bold">{isEdit ? 'Edit Book' : 'Add a New Book'}</h1>

        <div className="flex gap-4 items-start">
          <div className="w-28 h-40 rounded-lg bg-accent/40 dark:bg-white/5 flex-shrink-0 overflow-hidden flex items-center justify-center">
            {coverPreview ? (
              <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-stone-400 text-center px-2">No cover</span>
            )}
          </div>
          <label className="btn-secondary cursor-pointer">
            <Upload size={16} /> Upload Cover
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input required placeholder="Title *" className="input-field" value={form.title} onChange={handleChange('title')} />
          <input required placeholder="Author *" className="input-field" value={form.author} onChange={handleChange('author')} />
          <input placeholder="Publisher" className="input-field" value={form.publisher} onChange={handleChange('publisher')} />
          <input placeholder="ISBN" className="input-field" value={form.isbn} onChange={handleChange('isbn')} />
          <input placeholder="Genre" className="input-field" value={form.genre} onChange={handleChange('genre')} />
          <input placeholder="Language" className="input-field" value={form.language} onChange={handleChange('language')} />
          <input type="number" min="0" placeholder="Total Pages" className="input-field" value={form.pages} onChange={handleChange('pages')} />
          <input type="number" min="0" placeholder="Current Page" className="input-field" value={form.currentPage} onChange={handleChange('currentPage')} />

          <select className="input-field" value={form.status} onChange={handleChange('status')}>
            <option value="want-to-read">Want to Read</option>
            <option value="currently-reading">Currently Reading</option>
            <option value="finished">Finished</option>
            <option value="dropped">Dropped</option>
            <option value="paused">Paused</option>
            <option value="re-reading">Re-reading</option>
          </select>

          <select className="input-field" value={form.format} onChange={handleChange('format')}>
            <option>Paperback</option>
            <option>Hardcover</option>
            <option>Kindle</option>
            <option>Audiobook</option>
          </select>

          <input placeholder="Series Name" className="input-field" value={form.seriesName} onChange={handleChange('seriesName')} />
          <input type="number" placeholder="Book # in Series" className="input-field" value={form.seriesNumber || ''} onChange={handleChange('seriesNumber')} />

          <input placeholder="Purchase Link" className="input-field" value={form.purchaseLink} onChange={handleChange('purchaseLink')} />
          <input type="number" step="0.01" placeholder="Price" className="input-field" value={form.price} onChange={handleChange('price')} />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Rating</label>
          <StarRating value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
        </div>

        <textarea placeholder="Review" rows={3} className="input-field" value={form.review} onChange={handleChange('review')} />
        <textarea placeholder="Favorite Quote" rows={2} className="input-field" value={form.favoriteQuote} onChange={handleChange('favoriteQuote')} />
        <textarea placeholder="Personal Notes" rows={3} className="input-field" value={form.notes} onChange={handleChange('notes')} />
        <input placeholder="Tags (comma separated)" className="input-field" value={form.tags} onChange={handleChange('tags')} />

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isFavorite} onChange={handleChange('isFavorite')} />
            Mark as Favorite
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isWishlist} onChange={handleChange('isWishlist')} />
            Add to Wishlist
          </label>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
          <Save size={18} /> {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Book'}
        </button>
      </motion.form>
    </div>
  );
};

export default BookForm;
