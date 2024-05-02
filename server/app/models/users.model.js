module.exports = mongoose => {
  var schema = mongoose.Schema(
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
  },
  {timestamps: true}
);

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  module.exports = mongoose.model("users", schema);
};
