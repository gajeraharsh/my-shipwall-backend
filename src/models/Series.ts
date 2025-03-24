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
  position: {
    type: Number,
    required: true,
    default: 0,
  },
  gallery: [
    {
      url: { type: String, required: true },
      position: { type: Number, required: true },
    },
  ],

}, {
  timestamps: true,
});

seriesSchema.plugin(paginate);


const Series = mongoose.model<ISeries, any>("Series", seriesSchema);

export default Series;
