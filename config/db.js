import mongoose from "mongoose";

const getMongoURI = () => {
  switch (process.env.NODE_ENV) {
    case "production":
      return process.env.PROD_DATABASE_URL
    case "development":
      return process.env.DEV_DATABASE_URL
    default: return;
  }
}

export default async () => {
  const conn = await mongoose.connect(getMongoURI(), {
    // *** Docs: https://mongoosejs.com/docs/connections.html
    // The new url parser does not support connection strings that do not have a port
    useNewUrlParser: true,
    // Make Mongoose's default index build use createIndex() instead of ensureIndex()
    useCreateIndex: true,
    // False to make findOneAndUpdate() and findOneAndRemove()
    // use native findOneAndUpdate() rather than findAndModify().
    useFindAndModify: false,
    // True to opt in to using the MongoDB driver's new connection management engine.
    useUnifiedTopology: true,
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`.green.bold);
};
