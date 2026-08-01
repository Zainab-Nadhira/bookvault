import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const StarRating = ({ value = 0, onChange, readOnly = false, size = 20 }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hover || value);
        return (
          <motion.button
            key={star}
            type="button"
            disabled={readOnly}
            whileTap={!readOnly ? { scale: 1.3 } : {}}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => !readOnly && onChange && onChange(star)}
            aria-label={`${star} star`}
            className={readOnly ? 'cursor-default' : 'cursor-pointer'}
          >
            <Star
              size={size}
              className={active ? 'fill-primary text-primary' : 'fill-transparent text-stone-300 dark:text-stone-600'}
            />
          </motion.button>
        );
      })}
    </div>
  );
};

export default StarRating;
