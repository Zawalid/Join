class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields','search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  search(fields = []) {
    if (this.queryString.search) {
      const search = this.queryString.search.split(',').join('|');
      const regex = new RegExp(search, 'i'); // 'i' for case-insensitive
  
      const orConditions = fields.map(field => ({ [field]: regex }));
  
      this.query = this.query.find({ $or: orConditions });
    }
  
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.page = page;
    this.limit = limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  async respond() {
    const results = await this.query;
    const totalResults = await this.query.model.countDocuments(this.query.getFilter());
    const totalPages = Math.ceil(totalResults / this.limit);
    const totalDocuments = await this.query.model.countDocuments();

    return {
      status: 'success',
      data: {
        results,
        totalResults,
        totalPages,
        currentPage: this.page,
        pageSize: this.limit,
        totalDocuments,
      },
    };
  }
}
module.exports = ApiFeatures;
