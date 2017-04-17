class CriteriaManager {
    static buildCriteria(req, res, next) {
        let body = CriteriaManager._parseJSONQuery(req.query);

        req.fields = CriteriaManager._parseSort(body.fields);
        req.sort = CriteriaManager._parseSort(body.sort);
        req.query = body.query;
        req.limit = CriteriaManager._parseInteger(body.limit, 30);
        req.page = CriteriaManager._parseInteger(body.page, 1);

        req.body = Object.assign(req.body, body);

        next();
    }

    static _parseInteger(limit, defaultValue) {
        const limitInt = parseInt(limit);

        if (!isNaN(limitInt)) {
            return limitInt;
        }

        return defaultValue;
    }

    static _parseSort(sort) {
        if (sort && sort.length > 0) {
            let sortArray = sort.split(',');

            return sortArray.map(val => val.trim()).reduce((sortObject, item) => {
                let object = {};
                const sortValue = item.indexOf('-') == 0 ? -1 : 1;
                const itemKey = sortValue <= -1 ? item.substr(1) : item;
                object[itemKey] = sortValue;

                return Object.assign(sortObject, object);
            }, {});
        }

        return null;
    }

    static _parseJSONQuery(query) {
        for (let key in query) {
            try {
                query[key] = JSON.parse(query[key]);
            } catch (e) {
                // nothing to do
            }
        }

        return query;
    }
}

module.exports = CriteriaManager;