const mongoose = require('mongoose');
const paginate = require('./plugins/paginate');
const incrementId = require('./plugins/incrementId');

const PageSchema = new mongoose.Schema({
    pageGroup: { type: String, required: true },
    pageName: { type: String, required: true },
    pageLink: { type: String, required: true },
}, {
    timestamps: true,
});

const PermissionSchema = new mongoose.Schema({
    page: { type: mongoose.Schema.Types.ObjectId, ref: 'Page', required: true },
    view: { type: Boolean, default: false },
    add: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
});

const RoleSchema = new mongoose.Schema({
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

const PageModel = mongoose.model('Page', PageSchema);
const RoleModel = mongoose.model('Role', RoleSchema);

module.exports = { PageModel, RoleModel };
