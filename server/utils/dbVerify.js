import mongoose from "mongoose";

export async function runDatabaseVerification() {
  console.log("🔍 Verifying collections...");
  const collections = await mongoose.connection.db.listCollections().toArray();
  const collectionNames = collections.map((c) => c.name);
  console.log("✅ Collections in DB:", collectionNames);

  // CRUD smoke test on a lightweight temp collection
  const testSchema = new mongoose.Schema({
    name: { type: String },
    createdAt: { type: Date, default: Date.now },
  });

  const TestModel =
    mongoose.models.DbTest || mongoose.model("DbTest", testSchema, "db_test");

  // Execute Create -> Read -> Update -> Delete
  const newDoc = await TestModel.create({ name: "Connection Verified ✅" });
  console.log("📥 Created:", newDoc.toObject());

  const docs = await TestModel.find().lean();
  console.log("📤 Fetched:", docs);

  await TestModel.findByIdAndUpdate(newDoc._id, { name: "Updated Document" });
  console.log("✏️ Updated successfully");

  await TestModel.findByIdAndDelete(newDoc._id);
  console.log("🗑️ Deleted successfully");

  console.log("✅ CRUD operations working successfully");
}


