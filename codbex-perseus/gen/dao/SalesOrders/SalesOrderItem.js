const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_SALESORDERITEM",
	properties: [
		{
			name: "Id",
			column: "SALESORDERITEM_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "SalesOrder",
			column: "SALESORDERITEM_SALESORDER",
			type: "INTEGER",
		},
 {
			name: "Timesheet",
			column: "SALESORDERITEM_TIMESHEET",
			type: "INTEGER",
		},
 {
			name: "Hours",
			column: "SALESORDERITEM_HOURS",
			type: "DOUBLE",
		},
 {
			name: "Rate",
			column: "SALESORDERITEM_RATE",
			type: "DOUBLE",
		},
 {
			name: "Amount",
			column: "SALESORDERITEM_AMOUNT",
			type: "DOUBLE",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings);
};

exports.get = function(id) {
	return dao.find(id);
};

exports.create = function(entity) {
	entity["Amount"] = entity["Hours"] * entity["Rate"];
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "CODBEX_SALESORDERITEM",
		key: {
			name: "Id",
			column: "SALESORDERITEM_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	entity["Amount"] = entity["Hours"] * entity["Rate"];
	dao.update(entity);
	triggerEvent("Update", {
		table: "CODBEX_SALESORDERITEM",
		key: {
			name: "Id",
			column: "SALESORDERITEM_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "CODBEX_SALESORDERITEM",
		key: {
			name: "Id",
			column: "SALESORDERITEM_ID",
			value: id
		}
	});
};

exports.count = function (SalesOrder) {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERITEM" WHERE "SALESORDERITEM_SALESORDER" = ?', [SalesOrder]);
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERITEM"');
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
	producer.queue("codbex-perseus/SalesOrders/SalesOrderItem/" + operation).send(JSON.stringify(data));
}