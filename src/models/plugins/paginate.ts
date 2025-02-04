import { Schema, Document, Model, FilterQuery, Query } from 'mongoose';

interface PaginateOptions {
  pagination?: boolean;
  sortBy?: string;
  populate?: string;
  limit?: number;
  page?: number;
  select?: string;
}

interface QueryResult<T> {
  results: T[];
  page?: number;
  limit?: number;
  totalPages?: number;
  totalResults: number;
}

const paginate = <T extends Document>(schema: Schema<T>) => {
  schema.statics.paginate = async function (
    this: Model<T>, 
    filter: FilterQuery<T>,
    options: PaginateOptions
  ): Promise<QueryResult<T>> {
    let sort = '';
    if (options.sortBy) {
      const sortingCriteria: string[] = [];
      options.sortBy.split(',').forEach((sortOption) => {
        const [key, order] = sortOption.split(':');
        sortingCriteria.push((order === 'desc' ? '-' : '') + key);
      });
      sort = sortingCriteria.join(' ');
    } else {
      sort = 'createdAt';
    }

    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const page = options.page && options.page > 0 ? options.page : 1;
    const skip = (page - 1) * limit;

    // ✅ Explicitly defining the return type of countDocuments()
    const countPromise: Promise<number> = this.countDocuments(filter).exec();

    // ✅ Explicitly defining the return type of find() query
    let docsQuery = this.find(filter) as Query<T[], T>;

    docsQuery = docsQuery.sort(sort);
    if (options.select) {
      docsQuery = docsQuery.select(options.select);
    }
    if (options.pagination !== false) {
      docsQuery = docsQuery.skip(skip).limit(limit);
    }

    if (options.populate) {
      options.populate.split(',').forEach((populateOption) => {
        const [path, select] = populateOption.split(':');
        docsQuery = docsQuery.populate({
          path,
          select: select ? select.replace(/\|/g, ' ') : '',
        });
      });
    }

    // ✅ Using await for proper resolution
    const [totalResults, results] = await Promise.all([
      countPromise,
      docsQuery.exec(), // ✅ Ensure execution of the query
    ]);

    const result: QueryResult<T> = {
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

export default paginate;
