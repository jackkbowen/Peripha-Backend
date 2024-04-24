const { users } = require(".");

module.exports = mongoose => {
    var userSchema = mongoose.Schema(
        {
            email: String,
            username: String,
            password: String,
            createdAt: Date,
            updatedAt: Date
        },
        {timestamps: true}
    );

    // Allows id to be an object we can access
    userSchema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
      });

    const User = mongoose.model("User", userSchema);
    return User;


};