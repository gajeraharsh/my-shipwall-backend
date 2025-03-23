import mongoose, { Schema, Document, Model } from 'mongoose';
import paginate from './plugins/paginate';
import incrementId from './plugins/incrementId';

interface IPermission {
    page: mongoose.Types.ObjectId;
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
}

interface IPage extends Document {
    pageGroup: string;
    pageName: string;
    pageLink: string;
}

interface IRole extends Document {
    name: string;
    permissions: IPermission[];
    createdAt?: Date;
    updatedAt?: Date;
}

const PageSchema = new Schema<IPage>({
    pageGroup: { type: String, required: true },
    pageName: { type: String, required: true },
    pageLink: { type: String, required: true },
}, {
    timestamps: true,
});

const PermissionSchema = new Schema<IPermission>({
    page: { type: Schema.Types.ObjectId, ref: 'Page', required: true },
    view: { type: Boolean, default: false },
    add: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
});

const RoleSchema = new Schema<IRole>({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    permissions: [PermissionSchema],
}, {
    timestamps: true,
});

PageSchema.plugin(incrementId);
RoleSchema.plugin(incrementId);
RoleSchema.plugin(paginate);

const PageModel = mongoose.model<IPage, any>('Page', PageSchema);
const RoleModel = mongoose.model<IRole, any>('Role', RoleSchema);

export { PageModel, RoleModel };
