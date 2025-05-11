const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/auth');
const brandRoutes = require('./routes/brands');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});


// app.get('/delete',async (req,res)=>{
//   try{
//     await prisma.user.deleteMany({
//       where:{
//         role:
//         {
//           not: 'ADMIN'
//         }
//       }
//     })
//     return res.status(200).json({message: 'Deleted all users except admin'})



//   }
//   catch(err){
//     console.error(err)
//     return res.status(500).json({message: 'Error deleting users'})
//   }


// })

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 