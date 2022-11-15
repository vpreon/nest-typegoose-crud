import { defaultPaginate } from "./crud.config";
import { handleQueryError } from "./crud.helper";

export interface FindParams {
  where?: any;
  populate?: any;
  page?: number;
  skip?: number;
  limit?: number;
  select?: any;
  sort?: any;
  paginateKeys?: any;
  none?: boolean;
}

export abstract class BaseCrudService {
  public softDelete = false;

  abstract find(options: FindParams);

  abstract findOne({ id, populate, select });

  abstract create(body, populate);

  abstract update(id, body, populate, options?: object);

  abstract delete(id);

  abstract bulkCreate(data);
}

export class CrudService implements BaseCrudService {
  public softDelete = false;

  constructor(public model: any) {}

  async find(options: FindParams) {
    const {
      where = {},
      limit = 10,
      page = 1,
      skip = 0,
      populate = undefined,
      sort = undefined,
      select = undefined,
      paginateKeys = defaultPaginate
    } = options;
    const skipQuery = skip < 1 ? (page - 1) * limit : skip;
    let total = 0;
    let data: any = [];

    const find = async () => {
      if (!options.none) {
        const query = this.model
          .find()
          .where(where)
          .skip(skipQuery)
          .limit(limit)
          .sort(sort)
          .populate(populate)
          .select(select);
        data = await query;
        total = await this.model.countDocuments(where);
      }

      if (paginateKeys) {
        return {
          [paginateKeys.total]: total,
          [paginateKeys.data]: data,
          [paginateKeys.lastPage]: Math.ceil(total / options.limit),
          [paginateKeys.currentPage]: options.page
        };
      }
      return data;
    };
    return find();
  }

  async findOne({ id, populate = undefined, select = undefined }) {
    return this.model.findById(id).populate(populate).select(select);
  }

  async create(body, populate = undefined) {
    let model = await this.model.create(body).catch((err) => handleQueryError(err));
    if (populate) model = await model.populate(populate).execPopulate();
    return model;
  }

  async update(id, body, populate = undefined, options = {}) {
    return this.model
      .findOneAndUpdate({ _id: id }, body, {
        new: true,
        upsert: false,
        runValidators: true,
        populate: populate,
        ...options
      })
      .catch((err) => handleQueryError(err));
  }

  async delete(id) {
    if (this.softDelete) {
      return this.update(id, { deleted: true });
    } else {
      return this.model.findOneAndRemove({ _id: id });
    }
  }

  async bulkUpdate(where, body, options = {}) {
    return this.model.updateMany(where, body, options);
  }

  bulkDelete(where) {
    return this.model.deleteMany(where);
  }

  bulkCreate(data) {
    return this.model.insertMany(data);
  }
}
