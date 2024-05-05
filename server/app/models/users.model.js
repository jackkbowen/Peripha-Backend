const mongoose = require('mongoose')

const userSchema = mongoose.Schema(
    {
      email: {
        type: String,
         required:true, 
         unique:true
      },
      username: {
        type: String, 
        required:true, 
        unique:true
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
      }
  },
  {timestamps: true}
);


module.exports = mongoose.model('User', userSchema);

