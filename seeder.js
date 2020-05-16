// $node seeder -d (destroy) -i (initiate)
require = require("esm")(module);
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require("dotenv").config({ path: "./config/config.env" });
const colors = require('colors');

// Load models
const { User, Session, Message, Chat, Order } = require('./models');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

// Load mock data
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));
const sessions = JSON.parse(fs.readFileSync(`${__dirname}/_data/sessions.json`, 'utf-8'));
const orders = JSON.parse(fs.readFileSync(`${__dirname}/_data/orders.json`, 'utf-8'));


// Import into DB
const importData = async () => {
  try {
    await User.create(users);
    await Session.create(sessions);
    await Order.create(orders);
    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Session.deleteMany();
    await Message.deleteMany();
    await Chat.deleteMany();
    await Order.deleteMany();
    console.log('Data Destroyed...'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData()
}