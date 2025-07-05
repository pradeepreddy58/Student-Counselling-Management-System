const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv=require('dotenv')
dotenv.config();

const authRoutes = require('./routes/auth');
const collegeRoutes = require('./routes/colleges');
const counsellingRoutes = require('./routes/counselling');


const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/counselling', counsellingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
