const express = require('express');
const HTTPError = require('../http-error');
const AuthorizationManager = require('../authorization-manager');
const CriteriaManager = require('../criteria-manager');

class CRUDController {
  _changeScope(self, method) {
    return (req, res, next) => {
      self[method].call(self, req, res, next);
    }
  }

  constructor(model) {
    let self = this;

    this.model = model;

    this.router = express.Router();

    this.router.post('/',
      AuthorizationManager.isAuthorized,
      this._changeScope(self, 'beforeCreate'),
      this._changeScope(self, 'create'),
      this._changeScope(self, 'afterCreate'),
      this._changeScope(self, 'end')
    );

    this.router.put('/:id',
      AuthorizationManager.isAuthorized,
      this._changeScope(self, 'beforeUpdate'),
      this._changeScope(self, 'update'),
      this._changeScope(self, 'afterUpdate'),
      this._changeScope(self, 'end')
    );

    this.router.get('/:id?',
      AuthorizationManager.isAuthorized,
      CriteriaManager.buildCriteria,
      this._changeScope(self, 'beforeRead'),
      this._changeScope(self, 'read'),
      this._changeScope(self, 'afterRead'),
      this._changeScope(self, 'end')
    );

    this.router.delete('/:id',
      AuthorizationManager.isAuthorized,
      this._changeScope(self, 'beforeDelete'),
      this._changeScope(self, 'delete'),
      this._changeScope(self, 'afterDelete'),
      this._changeScope(self, 'end')
    );
  }

  beforeCreate(req, res, next) {
    next();
  }

  beforeUpdate(req, res, next) {
    next();
  }

  beforeRead(req, res, next) {
    next();
  }

  beforeDelete(req, res, next) {
    next();
  }

  afterCreate(req, res, next) {
    next();
  }

  afterUpdate(req, res, next) {
    next();
  }

  afterRead(req, res, next) {
    next();
  }

  afterDelete(req, res, next) {
    next();
  }

  end(req, res, next) {
    if (res.statusCode == undefined) {
      res.statusCode = 200;
    }

    if (res.response === undefined) {
      res.response = {};
    }

    res.status(res.statusCode).json(res.response);
  }

  read(req, res, next) {
    if (req.params.id) {
      this.model.findOne({ query: { _id: req.params.id }, fields: req.criteria.fields, options: { lean: true } })
        .then(resource => {
          if (resource == null) {
            next(new HTTPError(404));
          } else {
            res.readResource = resource;
            res.response = { data: resource };

            next();
          }
        }).catch(next);
    } else {
      let skip = null;

      if (req.criteria.page > 1) {
        skip = req.criteria.limit * (req.criteria.page - 1);
      }

      this.model.findAll({
        query: req.criteria.query,
        fields: req.criteria.fields,
        limit: req.criteria.limit,
        sort: req.criteria.sort,
        skip: skip,
        options: { lean: true }
      }).then(resources => {
        res.readResources = resources;
        res.response = { data: resources };

        next();
      }).catch(next);
    }
  }

  create(req, res, next) {
    this.model.validate(req.body)
      .then(({ isValid, validationErrors }) => {
        if (!isValid) {
          next(new HTTPError(400, 'Invalid data', validationErrors));
        } else {
          let instance = this.model.create(req.body);

          instance.save().then(createdResource => {
            res.createdResource = createdResource;
            res.response = { data: createdResource };

            next();
          }).catch(next);
        }
      }).catch(next);
  }

  update(req, res, next) {
    if (!req.params.id) {
      return next(new HTTPError(400, 'undefined resource id'));
    }

    this.model.findOne({ query: { _id: req.params.id } })
      .then(resource => {
        if (resource == null) {
          return next(new HTTPError(404));
        }

        req.body._id = req.params.id;

        for (let key in req.body) {
          resource[key] = req.body[key];
        }

        this.model.validate(resource)
          .then(({ isValid, validationErrors }) => {
            if (!isValid) {
              next(new HTTPError(400, 'Invalid data', validationErrors));
            } else {
              resource.save().then(updatedResource => {
                res.updatedResource = updatedResource;
                res.response = { data: updatedResource };

                next();
              }).catch(next);
            }
          }).catch(next);
      }).catch(next);
  }

  delete(req, res, next) {
    if (!req.params.id) {
      return next(new HTTPError(400, 'undefined resource id'));
    }

    this.model.findOne({ query: { _id: req.params.id } })
      .then(resource => {
        if (resource == null) {
          return next(new HTTPError(404));
        }

        resource.remove().then(deletedResource => {
          res.deletedResource = deletedResource;
          res.response = { message: 'Resource sucessfully deleted', data: deletedResource };

          next();
        }).catch(next);

      }).catch(next);
  }
}

module.exports = CRUDController;