const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");

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
			name: "Company",
			column: "SALARY_COMPANY",
			type: "INTEGER",
		},
 {
			name: "Currency",
			column: "SALARY_CURRENCY",
			type: "INTEGER",
		},
 {
			name: "Net",
			column: "SALARY_NET",
			type: "DOUBLE",
		},
 {
			name: "Gross",
			column: "SALARY_GROSS",
			type: "DOUBLE",
		},
 {
			name: "Total",
			column: "SALARY_TOTAL",
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
	let triggerExtensions = extensions.getExtensions("codbex-perseus/Salaries/Salary");
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
	producer.queue("codbex-perseus/Salaries/Salary").send(JSON.stringify(data));
}