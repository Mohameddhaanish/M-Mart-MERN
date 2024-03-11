class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const { keyword } = this.queryStr;
    if (keyword) {
      const regex = new RegExp(keyword, "i");
      this.query.find({ name: { $regex: regex } });
    }
    return this;
  }

  filter() {
    const { keyword, limit, page, ...rest } = this.queryStr;
    const queryObj = { ...rest };

    // Convert operators
    // Object.keys(queryObj).forEach((key) => {
    //   if (/^(gt|gte|lt|lte)$/.test(queryObj[key])) {
    //     queryObj[key] = { [`$${queryObj[key]}`]: queryObj[key] };
    //   }
    // });

    this.query.find(queryObj);
    return this;
  }

  paginate(resPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    this.query.limit(resPerPage).skip(skip);
    return this;
  }
}

module.exports = APIFeatures;
