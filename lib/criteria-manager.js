class CriteriaManager {
    static buildCriteria(req, res, next) {
        req.criteria = {
            fields: CriteriaManager._parseSort(req.query.fields),
            sort: CriteriaManager._parseSort(req.query.sort),
            query: CriteriaManager._parseJSONQuery(req.query.q),
            limit: CriteriaManager._parseInteger(req.query.limit, 30),
            page: CriteriaManager._parseInteger(req.query.page, 1)
        };

        next();
    }

    static _parseInteger(limit, defaultValue) {
        if (limit !== undefined) {
            const limitInt = parseInt(limit);

            if (!isNaN(limitInt)) {
                return limitInt;
            }
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