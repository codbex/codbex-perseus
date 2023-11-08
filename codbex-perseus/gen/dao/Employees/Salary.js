const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");
const EntityUtils = require("codbex-perseus/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CODBEX_SALARY",
	properties: [
		{
			name: "Id",
			column: "SALARY_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "SALARY_NAME",
			type: "VARCHAR",
		},
 {
			name: "Employee",
			column: "SALARY_EMPLOYEE",
			type: "INTEGER",
		},
 {
			name: "StartDate",
			column: "SALARY_STARTDATE",
			type: "DATE",
		},
 {
			name: "EndDate",
			column: "SALARY_ENDDATE",
			type: "DATE",
		},
 {
			name: "Net",
			column: "SALARY_NET",
			type: "DOUBLE",
		},
 {
			name: "IncomeTax",
			column: "SALARY_INCOMETAX",
			type: "DOUBLE",
		},
 {
			name: "SocialInsurance",
			column: "SALARY_SOCIALINSURANCE",
			type: "DOUBLE",
		},
 {
			name: "HealthInsurance",
			column: "SALARY_HEALTHINSURANCE",
			type: "DOUBLE",
		},
 {
			name: "PensionTax",
			column: "SALARY_PENSIONTAX",
			type: "DOUBLE",
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
		table: "CODBEX_SALARY",
		entity: entity,
		key: {
			name: "Id",
			column: "SALARY_ID",
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
		table: "CODBEX_SALARY",
		entity: entity,
		key: {
			name: "Id",
			column: "SALARY_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_SALARY",
		entity: entity,
		key: {
			name: "Id",
			column: "SALARY_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALARY"');
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
	let triggerExtensions = extensions.getExtensions("codbex-perseus/Employees/Salary");
	try {
		for (let i=0; i < triggerExtensions.length; i++) {
			let module = triggerExtensions[i];
			let triggerExtension = require(module);
			try {
				triggerExtension.trigger(data);
			} catch (error) {
				console.error(error);
			}			
		}
	} catch (error) {
		console.error(error);
	}
	producer.queue("codbex-perseus/Employees/Salary").send(JSON.stringify(data));
}