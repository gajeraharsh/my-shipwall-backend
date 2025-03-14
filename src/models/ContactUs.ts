import mongoose, { Schema } from 'mongoose';
import { IContactUs, ContactUsModel } from '../types/IContactUs';
import paginate from './plugins/paginate';

const contactUsSchema = new Schema<IContactUs, ContactUsModel>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
});

contactUsSchema.plugin(paginate);

const ContactUs = mongoose.model<IContactUs, any>('ContactUs', contactUsSchema);

export default ContactUs;
