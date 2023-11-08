const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");
const EntityUtils = require("codbex-perseus/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CODBEX_PROJECTASSIGNMENT",
	properties: [
		{
			name: "Id",
			column: "PROJECTASSIGNMENT_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "PROJECTASSIGNMENT_NAME",
			type: "VARCHAR",
		},
 {
			name: "Employee",
			column: "PROJECTASSIGNMENT_EMPLOYEE",
			type: "INTEGER",
		},
 {
			name: "Project",
			column: "PROJECTASSIGNMENT_PROJECT",
			type: "INTEGER",
		},
 {
			name: "Position",
			column: "PROJECTASSIGNMENT_POSITION",
			type: "INTEGER",
		},
 {
			name: "HourlyRate",
			column: "PROJECTASSIGNMENT_HOURLYRATE",
			type: "DOUBLE",
		},
 {
			name: "StartDate",
			column: "PROJECTASSIGNMENT_STARTDATE",
			type: "DATE",
		},
 {
			name: "EndDate",
			column: "PROJECTASSIGNMENT_ENDDATE",
			type: "DATE",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "StartDate");
		EntityUtils.setDate(e, "EndDate");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "StartDate");
	EntityUtils.setDate(entity, "EndDate");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "StartDate");
	EntityUtils.setLocalDate(entity, "EndDate");
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_PROJECTASSIGNMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "PROJECTASSIGNMENT_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	// EntityUtils.setLocalDate(entity, "StartDate");
	// EntityUtils.setLocalDate(entity, "EndDate");
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_PROJECTASSIGNMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "PROJECTASSIGNMENT_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_PROJECTASSIGNMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "PROJECTASSIGNMENT_ID",
			value: id
		}
	});
};

exports.count = function (Project) {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PROJECTASSIGNMENT" WHERE "PROJECTASSIGNMENT_PROJECT" = ?', [Project]);
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PROJECTASSIGNMENT"');
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
	producer.queue("codbex-perseus/Projects/ProjectAssignment").send(JSON.stringify(data));
}