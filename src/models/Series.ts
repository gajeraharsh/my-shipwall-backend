import mongoose, { Schema, Document } from "mongoose";
import { ISeries } from "../interfaces/seriesInterface";

const SeriesSchema: Schema = new Schema({
  brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  seriesName: { type: String, required: true },
  seriesUrl: { type: String, required: true },
  metaDesc: { type: String },
  pageTitle: { type: String },
  metaKeys: { type: String },
  thumbImage: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

SeriesSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const SeriesModel = mongoose.model<ISeries & Document>("Series", SeriesSchema);
export default SeriesModel;
