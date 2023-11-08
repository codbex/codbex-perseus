const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");
const EntityUtils = require("codbex-perseus/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CODBEX_TIMESHEET",
	properties: [
		{
			name: "Id",
			column: "TIMESHEET_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "TIMESHEET_NAME",
			type: "VARCHAR",
		},
 {
			name: "StartPeriod",
			column: "TIMESHEET_STARTPERIOD",
			type: "DATE",
		},
 {
			name: "EndPeriod",
			column: "TIMESHEET_ENDPERIOD",
			type: "DATE",
		},
 {
			name: "ProjectAssignment",
			column: "TIMESHEET_PROJECTASSIGNMENT",
			type: "INTEGER",
		},
 {
			name: "Hours",
			column: "TIMESHEET_HOURS",
			type: "INTEGER",
		},
 {
			name: "Rate",
			column: "TIMESHEET_RATE",
			type: "DOUBLE",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "StartPeriod");
		EntityUtils.setDate(e, "EndPeriod");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "StartPeriod");
	EntityUtils.setDate(entity, "EndPeriod");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "StartPeriod");
	EntityUtils.setLocalDate(entity, "EndPeriod");
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_TIMESHEET",
		entity: entity,
		key: {
			name: "Id",
			column: "TIMESHEET_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	// EntityUtils.setLocalDate(entity, "StartPeriod");
	// EntityUtils.setLocalDate(entity, "EndPeriod");
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_TIMESHEET",
		entity: entity,
		key: {
			name: "Id",
			column: "TIMESHEET_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_TIMESHEET",
		entity: entity,
		key: {
			name: "Id",
			column: "TIMESHEET_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_TIMESHEET"');
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
	producer.queue("codbex-perseus/Timesheets/Timesheet").send(JSON.stringify(data));
}