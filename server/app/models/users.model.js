const mongoose = require('mongoose')

const userSchema = mongoose.Schema(
    {
      email: {
        type: String,
         required: true, 
         unique: true
      },
      username: {
        type: String, 
        required: true, 
        unique: true
      },
      displayName: {
        type: String, 
        required: false, 
      },
      profilePicture: {
        type: String, 
        required: true, 
        default: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Question_Mark.svg/1200px-Question_Mark.svg.png"
      },
      bio: {
        type: String, 
        default: ""
      },
      hash: {
        type: String,
        required: true
      },
      salt: {
        type: String,
        required: true
      },
      products: {
        type: [String],
        default: []
      },
      token: {
        type: String,
        required: false
      }
  },
  {timestamps: true}
);


module.exports = mongoose.model('User', userSchema);

