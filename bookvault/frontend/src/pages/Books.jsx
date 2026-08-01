import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Plus, LayoutGrid, List as ListIcon, SlidersHorizontal } from 'lucide-react';
import api from '../services/api';
import BookCard from '../components/BookCard';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'want-to-read', label: 'Want to Read' },
  { value: 'currently-reading', label: 'Currently Reading' },
  { value: 'finished', label: 'Finished' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'paused', label: 'Paused' },
  { value: 're-reading', label: 'Re-reading' },
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Recently Added' },
  { value: 'title', label: 'Alphabetical' },
  { value: '-rating', label: 'Highest Rated' },
  { value: '-dateFinished', label: 'Newest Finished' },
  { value: 'dateFinished', label: 'Oldest Finished' },
];

const Books = ({ favoritesOnly = false, wishlistOnly = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState('');
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState('-createdAt');

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort, limit: 60 };
      if (search) params.search = search;
      if (status) params.status = status;
      if (genre) params.genre = genre;
      if (favoritesOnly) params.favorite = 'true';
      if (wishlistOnly) params.wishlist = 'true';

      const res = await api.get('/books', { params });
      setBooks(res.data.data);
    } finally {
      setLoading(false);
    }
  }, [search, status, genre, sort, favoritesOnly, wishlistOnly]);

  useEffect(() => {
    const t = setTimeout(fetchBooks, 300);
    return () => clearTimeout(t);
  }, [fetchBooks]);

  useEffect(() => {
    api.get('/books/meta/genres').then((res) => setGenres(res.data.data));
  }, []);

  const title = favoritesOnly ? 'Favorites' : wishlistOnly ? 'Wishlist' : 'My Books';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-stone-800 dark:text-stone-100">{title}</h1>
        <Link to="/books/new" className="btn-primary self-start sm:self-auto">
          <Plus size={18} /> Add Book
        </Link>
      </div>

      <div className="glass-card space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input
              placeholder="Search title, author, genre, ISBN, tags…"
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search books"
            />
          </div>
          <button onClick={() => setShowFilters((s) => !s)} className="btn-secondary">
            <SlidersHorizontal size={16} /> Filters
          </button>
          <div className="flex rounded-full bg-accent/40 dark:bg-white/10 p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-full ${view === 'grid' ? 'bg-white dark:bg-white/20 shadow-soft' : ''}`}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-full ${view === 'list' ? 'bg-white dark:bg-white/20 shadow-soft' : ''}`}
              aria-label="List view"
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-200/60 dark:border-white/10">
            <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select className="input-field" value={genre} onChange={(e) => setGenre(e.target.value)}>
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <select className="input-field" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[2/3] rounded-xl2" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="glass-card text-center py-16">
          <p className="text-stone-500 dark:text-stone-400">No books found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div
          className={
            view === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
              : 'flex flex-col gap-3'
          }
        >
          {books.map((b, i) =>
            view === 'grid' ? (
              <BookCard key={b._id} book={b} index={i} />
            ) : (
              <Link
                key={b._id}
                to={`/books/${b._id}`}
                className="glass-card flex items-center gap-4 hover:shadow-glow"
              >
                <div className="w-12 h-16 rounded-md bg-accent/40 dark:bg-white/5 flex-shrink-0 overflow-hidden">
                  {b.coverImage && <img src={b.coverImage} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{b.title}</p>
                  <p className="text-sm text-stone-500 truncate">{b.author}</p>
                </div>
                <span className="text-xs text-stone-400 flex-shrink-0">{b.status}</span>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Books;
