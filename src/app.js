const express = require('express');
const app = express();
const cors = require('cors');

const userRoutes = require('./routes/user.route');
const brandRoutes = require('./routes/brand.route');
const authRoutes = require('./routes/auth.route');
const productLineRoutes = require('./routes/productLine.route');
const postRoutes = require('./routes/post.route');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/product_lines', productLineRoutes);
app.use('/api/posts', postRoutes);

module.exports = app;
