const mongoose = require("mongoose");

const paginate = (schema) => {
  schema.statics.paginate = async function (filter, options) {
    let sort = "";
    if (options.sortBy) {
      const sortingCriteria = [];
      options.sortBy.split(",").forEach((sortOption) => {
        const [key, order] = sortOption.split(":");
        sortingCriteria.push((order === "desc" ? "-" : "") + key);
      });
      sort = sortingCriteria.join(" ");
    } else {
      sort = "createdAt";
    }

    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const page = options.page && options.page > 0 ? options.page : 1;
    const skip = (page - 1) * limit;

    // Explicitly defining the return type of countDocuments()
    const countPromise = this.countDocuments(filter).exec();

    // Explicitly defining the return type of find() query
    let docsQuery = this.find(filter);

    docsQuery = docsQuery.sort(sort);
    if (options.select) {
      docsQuery = docsQuery.select(options.select);
    }
    if (options.pagination !== false) {
      docsQuery = docsQuery.skip(skip).limit(limit);
    }

    if (options.populate) {
      if (Array.isArray(options.populate)) {
        options.populate.forEach((item) => {
          docsQuery = docsQuery.populate(item.path, item.select);
        });
      } else {
        docsQuery = docsQuery.populate(options.populate);
      }
    }

    // Using await for proper resolution
    const [totalResults, results] = await Promise.all([
      countPromise,
      docsQuery.exec(), // Ensure execution of the query
    ]);

    const result = {
      results,
      totalResults,
    };

    if (options.pagination !== false) {
      const totalPages = Math.ceil(totalResults / limit);
      Object.assign(result, {
        page,
        limit,
        totalPages,
      });
    }

    return result;
  };
};

module.exports = paginate;
