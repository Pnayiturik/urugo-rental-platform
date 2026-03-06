const mongoose = require('mongoose');
const Property = require('../src/models/Property');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await Property.updateMany(
    { landlord: { $exists: false } },
    { $set: { landlord: null } }
  );
  console.log(result);
  await mongoose.disconnect();
})();