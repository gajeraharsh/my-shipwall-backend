import mongoose, { Schema } from 'mongoose';
import { IGeneralSettingcode, GeneralsettingModal } from '../types/IGeneralSetting';
import paginate from './plugins/paginate';

const generalSettingSchema = new Schema<IGeneralSettingcode, GeneralsettingModal>({
    generalshippingcost: {
        type: Number,
    }
}, {
    timestamps: true,
});

generalSettingSchema.plugin(paginate);

const GeneralSettingModel = mongoose.model<IGeneralSettingcode, any>('GeneralSetting', generalSettingSchema);

export default GeneralSettingModel;
