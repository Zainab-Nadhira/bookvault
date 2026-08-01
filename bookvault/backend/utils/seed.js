require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Book = require('../models/Book');
const Goal = require('../models/Goal');

const run = async () => {
  await connectDB();

  await Promise.all([User.deleteMany({}), Book.deleteMany({}), Goal.deleteMany({})]);

  const user = await User.create({
    username: 'demoreader',
    email: 'demo@bookvault.app',
    password: 'password123',
    yearlyGoal: 40,
  });

  const now = new Date();
  const year = now.getFullYear();

  const sampleBooks = [
    {
      title: 'Project Hail Mary',
      author: 'Andy Weir',
      genre: 'Science Fiction',
      publisher: 'Ballantine Books',
      pages: 496,
      currentPage: 496,
      status: 'finished',
      rating: 5,
      isFavorite: true,
      dateStarted: new Date(year, 0, 3),
      dateFinished: new Date(year, 0, 12),
      review: 'A thrilling, funny, and emotional journey through space.',
      format: 'Kindle',
      tags: ['space', 'survival', 'sci-fi'],
    },
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      genre: 'Self-Help',
      publisher: 'Avery',
      pages: 320,
      currentPage: 320,
      status: 'finished',
      rating: 4,
      dateStarted: new Date(year, 1, 1),
      dateFinished: new Date(year, 1, 15),
      format: 'Paperback',
      tags: ['habits', 'productivity'],
    },
    {
      title: 'The Name of the Wind',
      author: 'Patrick Rothfuss',
      genre: 'Fantasy',
      publisher: 'DAW Books',
      pages: 662,
      currentPage: 240,
      status: 'currently-reading',
      dateStarted: new Date(year, now.getMonth(), 5),
      seriesName: 'The Kingkiller Chronicle',
      seriesNumber: 1,
      format: 'Hardcover',
      tags: ['fantasy', 'magic'],
    },
    {
      title: 'Dune',
      author: 'Frank Herbert',
      genre: 'Science Fiction',
      publisher: 'Ace Books',
      pages: 412,
      status: 'want-to-read',
      format: 'Paperback',
      tags: ['classic', 'sci-fi'],
    },
    {
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      genre: 'Non-Fiction',
      publisher: 'Harper',
      pages: 443,
      status: 'want-to-read',
      isWishlist: true,
      format: 'Kindle',
      price: 14.99,
      tags: ['history', 'anthropology'],
    },
  ];

  const books = await Book.insertMany(sampleBooks.map((b) => ({ ...b, user: user._id })));

  await Goal.create({ user: user._id, year, targetBooks: 40 });

  console.log('Seed complete.');
  console.log(`Demo login -> email: demo@bookvault.app | password: password123`);
  console.log(`Created ${books.length} sample books.`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
