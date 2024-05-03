const mongoose = require('mongoose')

const userSchema = mongoose.Schema(
    {
      name: {
        type: String,
         required:true, 
         unique:true
      },
      category: {
        type: String, 
        required:true, 
        unique:true
      },
      manufacturer: {
        type: String,
        required: true
      },
      model: {
        type: String,
        required: true
      },
  },
  {timestamps: true}
);


module.exports = mongoose.model('Product', userSchema);

