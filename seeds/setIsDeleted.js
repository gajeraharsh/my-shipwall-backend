const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://shipwall:shipwall@cluster0.sy4tt.mongodb.net';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const result = await mongoose.connection.collection('cities').updateMany(
      {},
      { $set: { isDeleted: false } }
    );

    console.log(`Updated ${result.modifiedCount} documents`);
    await mongoose.disconnect();
  })
  .catch(console.error);
