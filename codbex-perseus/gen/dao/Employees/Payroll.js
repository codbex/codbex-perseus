const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");
const EntityUtils = require("codbex-perseus/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CODBEX_PAYROLL",
	properties: [
		{
			name: "Id",
			column: "PAYROLL_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "PAYROLL_NAME",
			type: "VARCHAR",
		},
 {
			name: "Employee",
			column: "PAYROLL_EMPLOYEE",
			type: "INTEGER",
		},
 {
			name: "Amount",
			column: "PAYROLL_AMOUNT",
			type: "DOUBLE",
		},
 {
			name: "Description",
			column: "PAYROLL_DESCRIPTION",
			type: "VARCHAR",
		},
 {
			name: "Date",
			column: "PAYROLL_DATE",
			type: "DATE",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "Date");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "Date");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "Date");
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_PAYROLL",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYROLL_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	// EntityUtils.setLocalDate(entity, "Date");
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_PAYROLL",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYROLL_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_PAYROLL",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYROLL_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PAYROLL"');
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
};

function triggerEvent(data) {
	producer.queue("codbex-perseus/Employees/Payroll").send(JSON.stringify(data));
}