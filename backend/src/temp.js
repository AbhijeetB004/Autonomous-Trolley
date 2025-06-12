const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

// 🔒 Replace this with your actual MongoDB Atlas URI
const uri = "mongodb+srv://abhi:abhi@cluster0.cgmprsj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Replace with your actual DB name
const dbName = "test";

// Password to hash for admin
const plainPassword = "admin@123";

async function insertAdminUser() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection("users");

    // Generate bcrypt hash
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const adminUser = {
      userId: "USER_ADMIN_001",
      profile: {
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        phone: "",
        dateOfBirth: null
      },
      authentication: {
        passwordHash: passwordHash,
        lastLogin: null,
        loginCount: 0,
        accountStatus: "active"
      },
      preferences: {},
      orderHistory: {},
      loyalty: {},
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await users.insertOne(adminUser);
    console.log("✅ Admin user inserted with _id:", result.insertedId);
  } catch (err) {
    console.error("❌ Error inserting admin user:", err);
  } finally {
    await client.close();
  }
}

insertAdminUser();
