const mongoose = require('mongoose');
const paginate = require('./plugins/paginate');

const { Schema } = mongoose;

const brandSchema = new Schema({
  brandName: {
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

brandSchema.plugin(paginate);

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;
