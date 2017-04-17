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
      this._changeScope(self, 'create')
    );

    this.router.put('/:id',
      AuthorizationManager.isAuthorized,
      this._changeScope(self, 'beforeUpdate'),
      this._changeScope(self, 'update')
    );

    this.router.get('/:id?',
      AuthorizationManager.isAuthorized,
      CriteriaManager.buildCriteria,
      this._changeScope(self, 'beforeRead'),
      this._changeScope(self, 'read')
    );

    this.router.delete('/:id',
      AuthorizationManager.isAuthorized,
      this._changeScope(self, 'beforeDelete'),
      this._changeScope(self, 'delete')
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

  read(req, res, next) {
    if (req.params.id) {
      this.model.findOne({ query: { _id: req.params.id }, fields: req.fields, options: { lean: true } })
        .then(resource => {
          if (resource == null) {
            next(new HTTPError(404));
          } else {
            res.json({ data: resource });
          }
        }).catch(next);
    } else {
      let skip = null;

      if (req.page > 1) {
        skip = req.limit * (req.page - 1);
      }

      this.model.findAll({
        query: req.query,
        fields: req.fields,
        limit: req.limit,
        sort: req.sort,
        skip: skip,
        options: { lean: true }
      }).then(resources => {
        res.json({ data: resources });
      }).catch(next);
    }
  }

  create(req, res, next) {
    this.model.validate(req.body)
      .then(({ isValid, validationErrors }) => {
        if (!isValid) {
          res.status(400).json({ data: validationErrors });
        } else {
          let instance = this.model.create(req.body);

          instance.save().then(createdResource => {
            res.json({ data: createdResource });
          }).catch(next);
        }
      }).catch(next);
  }

  update(req, res, next) {
    if (!req.params.id) {
      return next(new HTTPError(400, 'undefined resource id'));
    }

    this.model.findOne({ _id: req.params.id })
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
              res.status(400).json({ data: validationErrors });
            } else {

              resource.save().then(updatedResource => {
                res.json({ data: updatedResource });
              }).catch(next);
            }
          }).catch(next);
      }).catch(next);
  }

  delete(req, res, next) {
    if (!req.params.id) {
      return next(new HTTPError(400, 'undefined resource id'));
    }

    this.model.findOne({ _id: req.params.id })
      .then(resource => {
        if (resource == null) {
          return next(new HTTPError(404));
        }

        resource.remove().then(deletedResource => {
          res.json({ message: 'Resource sucessfully deleted', data: deletedResource });
        }).catch(next);

      }).catch(next);
  }
}

module.exports = CRUDController;