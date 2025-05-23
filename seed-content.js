require('dotenv').config();
const mongoose = require('mongoose');
const Content = require('./server/models/Content');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    const items = [
      { title: "Funny Cat Video", status: "pending", type: "video" },
      { title: "Breaking News: Hamza Builds Snap News", status: "pending", type: "video" },
      { title: "Viral Clip: Watermelon Slice Falls", status: "pending", type: "video" }
    ];

    await Content.insertMany(items);
    console.log("✅ Sample content added.");
    process.exit();
  })
  .catch(err => {
    console.error("❌ Seeder failed:", err);
    process.exit(1);
  });
