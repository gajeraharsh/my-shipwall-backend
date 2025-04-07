// plugins/autoIncrementId.js
const mongoose = require("mongoose");

// Define the internal model to track unique ID sequences
const uniqueIdTrackerSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g., 'recipientId'
  seq: { type: Number, default: 0 },     // sequence counter
});

// Register the model only once to prevent OverwriteModelError
const UniqueIdTracker = mongoose.models.UniqueIdTracker || mongoose.model("UniqueIdTracker", uniqueIdTrackerSchema);

/**
 * Mongoose plugin to auto-generate a unique ID with a prefix.
 *
 * @param {mongoose.Schema} schema - The Mongoose schema to apply the plugin to.
 * @param {Object} options - Plugin options.
 * @param {string} options.field - Field to auto-generate (e.g., "recipientId").
 * @param {string} options.prefix - Prefix for the value (e.g., "QVAP").
 * @param {string} options.counterKey - Unique key for the counter (e.g., "recipientId").
 */
function autoIncrementId(schema, options) {
  const { field = "autoId", prefix = "", counterKey = "" } = options;

  schema.pre("save", async function (next) {
    if (this.isNew && !this[field]) {
      try {
        const tracker = await UniqueIdTracker.findByIdAndUpdate(
          { _id: counterKey },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );

        this[field] = `${prefix}${String(tracker.seq).padStart(6, "0")}`;
        next();
      } catch (err) {
        next(err);
      }
    } else {
      next();
    }
  });
}

module.exports = autoIncrementId;
