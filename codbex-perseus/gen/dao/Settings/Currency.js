const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");
const EntityUtils = require("codbex-perseus/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CODBEX_CURRENCY",
	properties: [
		{
			name: "Id",
			column: "CURRENCY_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "CURRENCY_NAME",
			type: "VARCHAR",
		},
 {
			name: "Default",
			column: "CURRENCY_DEFAULT",
			type: "BOOLEAN",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setBoolean(e, "Default");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setBoolean(entity, "Default");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setBoolean(entity, "Default");
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "CODBEX_CURRENCY",
		key: {
			name: "Id",
			column: "CURRENCY_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	EntityUtils.setBoolean(entity, "Default");
	dao.update(entity);
	triggerEvent("Update", {
		table: "CODBEX_CURRENCY",
		key: {
			name: "Id",
			column: "CURRENCY_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "CODBEX_CURRENCY",
		key: {
			name: "Id",
			column: "CURRENCY_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CURRENCY"');
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
};

function triggerEvent(operation, data) {
	producer.queue("codbex-perseus/Settings/Currency/" + operation).send(JSON.stringify(data));
}