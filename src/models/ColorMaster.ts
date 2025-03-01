import mongoose, { Schema } from 'mongoose';
import { IColorMastercode, ColorMasterModel } from '../types/IColormaster';
import paginate from './plugins/paginate';

const colorMasterSchema = new Schema<IColorMastercode, ColorMasterModel>({
    colorName: {
        type: String,
        required: true
    },
    colorCode: {
        type: String,
        required: true
    }
}, {
    timestamps: true,   
});

colorMasterSchema.plugin(paginate);

const ColorMasterModel = mongoose.model<IColorMastercode, any>('ColorMaster', colorMasterSchema);

export default ColorMasterModel;
