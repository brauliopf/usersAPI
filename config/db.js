import mongoose from "mongoose";

export default async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    // *** Docs: https://mongoosejs.com/docs/connections.html
    // The new url parser does not support connection strings that do not have a port
    useNewUrlParser: true,
    // Make Mongoose's default index build use createIndex() instead of ensureIndex()
    useCreateIndex: true,
    // False to make findOneAndUpdate() and findOneAndRemove()
    // use native findOneAndUpdate() rather than findAndModify().
    useFindAndModify: false,
    // True to opt in to using the MongoDB driver's new connection management engine.
    useUnifiedTopology: true
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`.green.bold);
};
