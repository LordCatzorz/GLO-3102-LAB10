const mongoose = require('mongoose');

const userSchema = new mongoose.Schema();
userSchema.add({
    id: String
});

userSchema.methods.toDTO = function() {
    const obj = this.toObject();

    const dto = {
        id: obj.id
    };

    return dto;
};

const User = mongoose.model('User', userSchema);

exports.schema = userSchema;
exports.model = User;