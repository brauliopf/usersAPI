import mongoose from "mongoose";

const getMongoURI = () => {
  switch (process.env.NODE_ENV) {
    case "production":
      return process.env.MONGO_URI_PROD
    case "development":
      return process.env.TEST_NICK_DEV
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
    // this setting is used to tell mongoose to return updated data upon an update
    // rather than the original.
    returnOriginal: false
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`.green.bold);
};
