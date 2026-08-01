import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, Pencil, Trash2, Heart, BookOpen, Quote, StickyNote, ExternalLink } from 'lucide-react';
import api from '../services/api';
import StarRating from '../components/StarRating';

const statusLabels = {
  'want-to-read': 'Want to Read',
  'currently-reading': 'Currently Reading',
  finished: 'Finished',
  dropped: 'Dropped',
  paused: 'Paused',
  're-reading': 'Re-reading',
};

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/books/${id}`);
      setBook(res.data.data);
      if (res.data.data.genre) {
        const rel = await api.get('/books', { params: { genre: res.data.data.genre, limit: 6 } });
        setRelated(rel.data.data.filter((b) => b._id !== id));
      }
    } catch {
      toast.error('Book not found');
      navigate('/books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleFavorite = async () => {
    const res = await api.put(`/books/${id}`, { isFavorite: !book.isFavorite });
    setBook(res.data.data);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${book.title}" from your vault? This can't be undone.`)) return;
    await api.delete(`/books/${id}`);
    toast.success('Book removed');
    navigate('/books');
  };

  if (loading || !book) return <div className="skeleton h-96 rounded-xl2" />;

  const progress = book.pages > 0 ? Math.min(100, Math.round((book.currentPage / book.pages) * 100)) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-primary text-sm">
        <ArrowLeft size={16} /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-accent/40 dark:bg-white/5 flex items-center justify-center">
          {book.coverImage ? (
            <img src={book.coverImage} alt={`${book.title} cover`} className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="text-primary/40" size={56} />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-accent/60 dark:bg-white/10 text-primary dark:text-accent mb-2">
                {statusLabels[book.status]}
              </span>
              <h1 className="font-display text-3xl font-bold">{book.title}</h1>
              <p className="text-stone-500 dark:text-stone-400 mt-1">by {book.author}</p>
              {book.seriesName && (
                <p className="text-sm text-stone-400 mt-0.5">
                  {book.seriesName} {book.seriesNumber ? `#${book.seriesNumber}` : ''}
                </p>
              )}
            </div>
            <button onClick={toggleFavorite} aria-label="Toggle favorite">
              <Heart size={26} className={book.isFavorite ? 'fill-red-500 text-red-500' : 'text-stone-300'} />
            </button>
          </div>

          <StarRating value={book.rating} readOnly />

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-500 dark:text-stone-400">
            {book.publisher && <span>Publisher: {book.publisher}</span>}
            {book.isbn && <span>ISBN: {book.isbn}</span>}
            {book.genre && <span>Genre: {book.genre}</span>}
            {book.language && <span>Language: {book.language}</span>}
            {book.pages > 0 && <span>Pages: {book.pages}</span>}
            <span>Format: {book.format}</span>
          </div>

          {book.status === 'currently-reading' && book.pages > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{book.currentPage} / {book.pages} pages ({progress}%)</span>
              </div>
              <div className="h-2 rounded-full bg-accent/50 dark:bg-white/10 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 text-xs text-stone-500">
            {book.dateStarted && <span>Started: {new Date(book.dateStarted).toLocaleDateString()}</span>}
            {book.dateFinished && <span>Finished: {new Date(book.dateFinished).toLocaleDateString()}</span>}
          </div>

          {book.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {book.tags.map((t) => (
                <span key={t} className="text-xs px-2 py-1 rounded-full bg-secondary/20 text-primary dark:text-accent">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {book.purchaseLink && (
            <a href={book.purchaseLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              <ExternalLink size={14} /> Purchase link {book.price ? `— $${book.price}` : ''}
            </a>
          )}

          <div className="flex gap-3 pt-2">
            <Link to={`/books/${id}/edit`} className="btn-secondary">
              <Pencil size={16} /> Edit
            </Link>
            <button onClick={handleDelete} className="btn-secondary text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      </motion.div>

      {book.review && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card">
          <h3 className="font-display font-semibold text-lg mb-2">My Review</h3>
          <p className="text-stone-600 dark:text-stone-300 whitespace-pre-wrap">{book.review}</p>
        </motion.div>
      )}

      {book.favoriteQuote && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card">
          <h3 className="font-display font-semibold text-lg mb-2 flex items-center gap-2">
            <Quote size={18} /> Favorite Quote
          </h3>
          <p className="italic text-stone-600 dark:text-stone-300">"{book.favoriteQuote}"</p>
        </motion.div>
      )}

      {book.notes && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card">
          <h3 className="font-display font-semibold text-lg mb-2 flex items-center gap-2">
            <StickyNote size={18} /> Personal Notes
          </h3>
          <p className="text-stone-600 dark:text-stone-300 whitespace-pre-wrap">{book.notes}</p>
        </motion.div>
      )}

      {related.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-lg mb-4">Related Books ({book.genre})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {related.map((b) => (
              <Link key={b._id} to={`/books/${b._id}`} className="glass-card block">
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-accent/40 dark:bg-white/5 mb-2 flex items-center justify-center">
                  {b.coverImage ? (
                    <img src={b.coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="text-primary/40" size={28} />
                  )}
                </div>
                <p className="text-sm font-medium truncate">{b.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
