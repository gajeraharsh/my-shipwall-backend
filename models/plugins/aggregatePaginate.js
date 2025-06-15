const aggregatePaginate = (schema) => {
  schema.statics.paginate = async function (filter = {}, options = {}) {
    const limit =
      options.limit && options.limit > 0 ? parseInt(options.limit) : 10;
    const page = options.page && options.page > 0 ? parseInt(options.page) : 1;
    const skip = (page - 1) * limit;

    const pipeline = [];
    const modelName = this.modelName;
    let collectionMap = {
      brand: "brands",
      category: "categories",
      series: "series",
      color: "colormasters",
      product: "products",
      returnOrder: "returnorders",
      rejectionOrder: "rejectionorders",
      state: "states",
      city: "cities",
      user: "users",
      salePerson: "users",
      adminRole: "roles",
    };

    if (modelName === "RewardOrder") {
      collectionMap["product"] = "rewardproducts";
    }

    // 1. Handle populate first
    if (options.populate) {
      const populates = Array.isArray(options.populate)
        ? options.populate
        : [options.populate];

      populates.forEach((pop) => {
        if (pop.path === "returnOrder") {
          pipeline.push({
            $lookup: {
              from: "returnorders",
              localField: "_id",
              foreignField: "order",
              as: "returnOrder",
              pipeline: [
                { $match: { returnStatus: { $ne: "Cancelled" } } },
                { $limit: 1 }, // justOne
              ],
            },
          });

          pipeline.push({
            $unwind: {
              path: "$returnOrder",
              preserveNullAndEmptyArrays: true,
            },
          });
        } else {
          const pathParts = pop.path.split(".");

          if (pathParts.length === 1) {
            const fromCollection = collectionMap[pop.path] || `${pop.path}s`;

            pipeline.push({
              $lookup: {
                from: fromCollection,
                localField: pop.path,
                foreignField: "_id",
                as: pop.path,
              },
            });

            pipeline.push({
              $unwind: {
                path: `$${pop.path}`,
                preserveNullAndEmptyArrays: true,
              },
            });
          } else if (pathParts.length === 2) {
            const [arrayField, nestedField] = pathParts;
            const fromCollection =
              collectionMap[nestedField] || `${nestedField}s`;

            pipeline.push({
              $unwind: {
                path: `$${arrayField}`,
                preserveNullAndEmptyArrays: true,
              },
            });

            pipeline.push({
              $lookup: {
                from: fromCollection,
                localField: `${arrayField}.${nestedField}`,
                foreignField: "_id",
                as: `${arrayField}.${nestedField}`,
              },
            });

            pipeline.push({
              $unwind: {
                path: `$${arrayField}.${nestedField}`,
                preserveNullAndEmptyArrays: true,
              },
            });

            pipeline.push({
              $group: {
                _id: "$_id",
                doc: { $first: "$$ROOT" },
                [arrayField]: { $push: `$${arrayField}` },
              },
            });

            pipeline.push({
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: ["$doc", { [arrayField]: `$${arrayField}` }],
                },
              },
            });
          }
        }
      });
    }

    // 2. Now apply filter (search) after population
    if (Object.keys(filter).length > 0) {
      pipeline.push({ $match: filter });
    }

    // 3. Sort
    if (options.sortBy) {
      const sortStage = {};
      options.sortBy.split(",").forEach((sortOption) => {
        const [key, order] = sortOption.split(":");
        sortStage[key] = order === "desc" ? -1 : 1;
      });
      pipeline.push({ $sort: sortStage });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    // 4. Count total for pagination (without skip and limit)
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await this.aggregate(countPipeline).exec();
    const totalResults = countResult[0]?.total || 0;
    const totalPages = Math.ceil(totalResults / limit);

    // 5. Add pagination stages
    if (options?.pagination != false) {
      pipeline.push({ $skip: skip }, { $limit: limit });
    }

    // 6. Execute main aggregation query
    const results = await this.aggregate(pipeline).exec();

    return {
      results,
      totalResults,
      page,
      limit,
      totalPages,
    };
  };
};

module.exports = aggregatePaginate;
