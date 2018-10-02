function getOne(model, id) {
  return new Promise((resolve, reject) => {
    model.findById(id, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

function getAll(model, search = null) {
  var query = {}

  if (search) {
    query.$text = {
      $search: search
    }
  }

  return new Promise((resolve, reject) => {
    model.find(query, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

function save(model) {
  return new Promise((resolve, reject) => {
    const now = new Date();
    model.updatedAt = now;
    if (!model.createdAt) {
      model.createdAt = now;
    }

    model.save((error) => {
      if (error) {
        reject(error);
      } else {
        resolve(model);
      }
    });
  });
}

function del(model, id) {
  return new Promise((resolve, reject) => {
    model.deleteOne({
      _id: id
    }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}


module.exports = {
  getOne,
  getAll,
  save,
  del
};
