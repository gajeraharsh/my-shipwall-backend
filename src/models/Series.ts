import mongoose, { Schema, Model, Document } from "mongoose";
import { ISeries, SeriesModel } from "../types/ISeries";
import paginate from "./plugins/paginate";

const seriesSchema = new Schema<ISeries, SeriesModel>({
  brand: {
    type: Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  seriesName: {
    type: String,
    required: true
  },
  seriesUrl: {
    type: String,
    required: true
  },
  metaDescription: {
    type: String
  },
  pageTitle: {
    type: String
  },
  metaKeywords: {
    type: String
  },
  thumbImage: {
    type: String, required: true
  },
  thumbImageUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Published'],
    default: "Draft",
  },
}, {
  timestamps: true,
});

seriesSchema.plugin(paginate);


const Series: Model<ISeries> = mongoose.model<ISeries & Document>("Series", seriesSchema);

export default Series;
