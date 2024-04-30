const passportLocalMongoose = require('passport-local-mongoose');

module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      // No Password needed, User.register() will create a hashed password
    
      email: {type: String, required:true, unique:true},
      username: {type: String, required:true, unique:true},
  },
  {timestamps: true}
);

  schema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  schema.plugin(passportLocalMongoose);

  const Users = mongoose.model("users", schema);
  return Users;
};
