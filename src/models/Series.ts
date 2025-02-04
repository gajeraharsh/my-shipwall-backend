import mongoose, { Schema,Model, Document } from "mongoose";
import { ISeries } from "../types/ISeries";

const seriesSchema = new Schema<ISeries>({
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
}
}, {
  timestamps: true,
});



const Series: Model<ISeries> = mongoose.model<ISeries & Document>("Series", seriesSchema);

export default Series;
