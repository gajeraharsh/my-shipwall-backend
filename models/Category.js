const mongoose = require('mongoose');
const paginate = require('./plugins/paginate');

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
  }
}, {
  timestamps: true,
});

categorySchema.plugin(paginate);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
