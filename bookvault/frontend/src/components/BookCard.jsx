import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, BookOpen } from 'lucide-react';
import StarRating from './StarRating';

const statusColors = {
  'want-to-read': 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  'currently-reading': 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  finished: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  dropped: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  paused: 'bg-stone-200 text-stone-600 dark:bg-stone-500/20 dark:text-stone-300',
  're-reading': 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
};

const statusLabels = {
  'want-to-read': 'Want to Read',
  'currently-reading': 'Reading',
  finished: 'Finished',
  dropped: 'Dropped',
  paused: 'Paused',
  're-reading': 'Re-reading',
};

const BookCard = ({ book, index = 0 }) => {
  const progress = book.pages > 0 ? Math.min(100, Math.round((book.currentPage / book.pages) * 100)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/books/${book._id}`} className="glass-card block group relative overflow-hidden">
        {book.isFavorite && (
          <Heart size={16} className="absolute top-4 right-4 fill-red-500 text-red-500 z-10" />
        )}
        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-accent/40 dark:bg-white/5 mb-3 flex items-center justify-center">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={`${book.title} cover`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <BookOpen className="text-primary/40" size={40} />
          )}
        </div>
        <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full mb-2 ${statusColors[book.status]}`}>
          {statusLabels[book.status]}
        </span>
        <h3 className="font-display font-semibold text-stone-800 dark:text-stone-100 leading-tight line-clamp-2">
          {book.title}
        </h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">{book.author}</p>

        {book.status === 'currently-reading' && (
          <div className="mt-2 h-1.5 rounded-full bg-accent/50 dark:bg-white/10 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        {book.rating > 0 && (
          <div className="mt-2">
            <StarRating value={book.rating} readOnly size={14} />
          </div>
        )}
      </Link>
    </motion.div>
  );
};

export default BookCard;
