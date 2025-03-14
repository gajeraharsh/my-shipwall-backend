import mongoose, { Schema, Document, Model } from "mongoose";

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
    id?: string; // This field will store the generated unique ID
}

const generateIncrementId = (prefix: string) =>
    async function (this: HasIncrementId, next: Function) {
        if (!this.isNew) return next(); // Only generate for new documents

        try {
            const counter = await Counter.findByIdAndUpdate(
                { _id: prefix }, // Unique counter for each prefix
                { $inc: { seq: 1 } },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );

            if (counter) {
                const formattedSeq = counter.seq.toString().padStart(5, "0"); // Ensures 00001 format
                this.id = `${prefix}${formattedSeq}`;
            }

            next();
        } catch (error) {
            next(error);
        }
    };

export default (schema: Schema, prefix: string) => {
    // Define the field with default value to avoid validation errors
    schema.add({ id: { type: String, unique: true, required: true, default: "" } });

    // Use `pre("validate")` instead of `pre("save")` to set `id` before validation runs
    schema.pre<HasIncrementId>("validate", generateIncrementId(prefix));
};
