// models/BuffMap.js
const mongoose = require('mongoose');

const BuffMapSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  buffs: {
    type: Map,
    of: Date, // or Number if you prefer UNIX timestamps
    default: {},
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('BuffMap', BuffMapSchema);