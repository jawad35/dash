const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true,
    default: 'User'
  },
  encryption_key: {
    type: String,
    required: true
  },
  password: { 
    type: String,
    required: true
  },
  files: [
    {
      file_name: {
        type: String
      },
      public: {
        type: Boolean
      },
      file_creationDate: {
        type: String
      },
      file_size: {
        type: Number
      }
    }
  ]
});

// export the model
module.exports = mongoose.model('User', userSchema);
