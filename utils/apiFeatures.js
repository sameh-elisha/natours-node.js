class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // Take shadow copy
    const objQuery = { ...this.queryString };
    const excludedFields = ['sort', 'page', 'limit', 'fields'];
    excludedFields.forEach(elm => delete objQuery[elm]);
    // Json to string
    let filterString = JSON.stringify(objQuery);
    // Add $ before this words to make filter work
    filterString = filterString.replace(
      /\b(lte|lt|gt|gte)\b/g,
      match => `$${match}`
    );

    this.query = this.query.find(JSON.parse(filterString));
    return this;
  }

  sort() {
    // Sorting
    // Check is there sort object
    if (this.queryString.sort) {
      // {sort: "price,avg"}
      const sort = this.queryString.sort.split(',').join(' ');
      // "price avg"
      this.query = this.query.sort(sort);
    } else {
      // Default sort
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    // Selecting
    if (this.queryString.fields) {
      // {fields: 'name,price'}
      const fields = this.queryString.fields.split(',').join(' ');
      // "name price"
      this.query = this.query.select(`${fields}`);
    } else {
      // Default if there neg "-" before word this meaning excluded it
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    // Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 30;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
