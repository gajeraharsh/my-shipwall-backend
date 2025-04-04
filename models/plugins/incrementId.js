const mongoose = require("mongoose");
const { Schema } = mongoose;

const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", CounterSchema);

const generateIncrementId = (prefix) =>
  async function (next) {
    if (!this.isNew) return next(); // Only generate for new documents

    try {
      const counterKey = prefix || "incId";

      const counter = await Counter.findByIdAndUpdate(
        { _id: counterKey },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      if (counter) {
        if (prefix) {
          const formattedSeq = counter.seq.toString().padStart(5, "0"); // QVAPCUS00001
          this.id = `${prefix}${formattedSeq}`;
        } else {
          this.incId = counter.seq; // Simple sequence: 1, 2, 3...
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };

module.exports = (schema, prefix) => {
  if (prefix) {
    schema.add({
      id: { type: String, unique: true, required: true, default: "" },
    });
    schema.pre("validate", generateIncrementId(prefix));
  } else {
    schema.add({
      incId: { type: Number, unique: true, required: true, default: 0 },
    });
    schema.pre("validate", generateIncrementId());
  }
};
