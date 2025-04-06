const mongoose = require('mongoose');
const paginate = require('./plugins/paginate');

const { Schema } = mongoose;

const bannerSchema = new Schema({
    bannerName: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    bannerImage: {
        type: String,
    },
    bannerImageUrl: {
        type: String,
    }
}, {
    timestamps: true,
});

bannerSchema.plugin(paginate);

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;