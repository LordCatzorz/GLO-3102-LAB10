const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema();
taskSchema.add({
    user: String,
    id: String,
    name: String
});

taskSchema.methods.toDTO = function() {
  const obj = this.toObject();

  const dto = {
      user: obj.user,
      id: obj.id,
      name: obj.name
  };

  return dto;
};

const Task = mongoose.model('Task', taskSchema);

exports.schema = taskSchema;
exports.model = Task;