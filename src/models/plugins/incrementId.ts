import mongoose, { Schema, Document } from "mongoose";

interface ICounter extends Document {
    _id: string;
    seq: number;
}

const CounterSchema = new Schema<ICounter>({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
});

const Counter = mongoose.model<ICounter>("Counter", CounterSchema);

interface HasIncrementId extends Document {
    _id: mongoose.Types.ObjectId;
    id?: string;  // Stores prefixed ID
    incId?: number; // Stores simple incremental ID
}

const generateIncrementId = (prefix?: string) =>
    async function (this: HasIncrementId, next: Function) {
        if (!this.isNew) return next(); // Only generate for new documents

        try {
            // Use prefix if provided; otherwise, default to "incId"
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

export default (schema: Schema, prefix?: string) => {
    // Add both ID fields but use only the required one based on usage
    if (prefix) {
        schema.add({ id: { type: String, unique: true, required: true, default: "" } });
        schema.pre<HasIncrementId>("validate", generateIncrementId(prefix));
    } else {
        schema.add({ incId: { type: Number, unique: true, required: true, default: 0 } });
        schema.pre<HasIncrementId>("validate", generateIncrementId());
    }
};
