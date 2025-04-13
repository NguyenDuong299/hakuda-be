const express = require('express');
const app = express();
const cors = require('cors');

const userRoutes = require('./routes/user.route');
const brandRoutes = require('./routes/brand.route');
const authRoutes = require('./routes/auth.route');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/brands', brandRoutes);

module.exports = app;
