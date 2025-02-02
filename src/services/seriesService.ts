import Series from '../models/Series';
import ApiError from '../utils/apiError';
import { ISeriesbody } from '../types/ISeries';
import httpStatus from 'http-status';


export const createNewSeries = async (seriesbody: ISeriesbody) => {
    const seriesData = {
      ...seriesbody,
    };
    return await Series.create(seriesData);
  };

  /**
 * Query for Series with pagination and options
 * @param {Object} options - Query options (e.g., pagination, sort, populate)
 * @returns {Promise<QueryResult>}
 */

  
  export const fetchSeries = async () => {
    try {
    //   const series = await Series.paginate({}, {});
        const series = await Series.find();
        
        
        if (!series || series.length === 0) {
          throw new ApiError(httpStatus.NOT_FOUND, 'No series found');
        }
    
        return series;
      } catch (err: any) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving brands');
      }
  }

  export const fetchSeriesDropdown = async () => {
    try {
      const series = await Series.find({}, { _id: 1, seriesName: 1 });
  
      if (!series || series.length === 0) {
        throw new ApiError(httpStatus.NOT_FOUND, 'No series found');
      }
      return series;
    } catch (err: any) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving brands');
    }
  };

  export const getSeriesByIdService = async (seriesId: string) => {
    try {
      const series = await Series.findById(seriesId);

      if (!series) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Series not found');
      }
  
      return series;
    } catch (err: any) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error retrieving series');
    }
  };

  export const updateSeriesById = async (seriesId: string, updateData: Partial<ISeriesbody>) => {
    try {
      const series = await Series.findByIdAndUpdate(seriesId, updateData, { new: true, runValidators: true });
      if (!series) throw new ApiError(httpStatus.NOT_FOUND, 'Series not found');
      return series;
    } catch (err: any) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error updating series');
    }
  };
  
  export const deleteSeriesById = async (seriesId: string) => {
    try {
      const series = await Series.findByIdAndDelete(seriesId);
      if (!series) throw new ApiError(httpStatus.NOT_FOUND, 'series not found');
      return series;
    } catch (err: any) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting brand');
    }
  };
  
