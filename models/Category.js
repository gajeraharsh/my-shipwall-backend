const mongoose = require('mongoose');
const paginate = require('./plugins/aggregatePaginate');

const { Schema } = mongoose;

const categorySchema = new Schema({
  brand: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'Published'],
    default: "Draft",
  },
  categoryName: {
    type: String,
    required: true,
  },
  categoryUrl: {
    type: String,
    required: true,
  },
  pageTitle: {
    type: String,
  },
  metaDescription: {
    type: String,
  },
  metaKeywords: {
    type: String,
  },
  iconImage: {
    type: String,
    required: true,
  },
  iconImageUrl: {
    type: String,
    required: true,
  },
  displayHome: {
    type: Boolean,
    default: false,
  },
  position: {
    type: Number,
    required: true,
    default: 0,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

categorySchema.plugin(paginate);

categorySchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
