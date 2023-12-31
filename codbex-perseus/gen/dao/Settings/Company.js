const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_COMPANY",
	properties: [
		{
			name: "Id",
			column: "COMPANY_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "COMPANY_NAME",
			type: "VARCHAR",
		},
 {
			name: "Email",
			column: "COMPANY_EMAIL",
			type: "VARCHAR",
		},
 {
			name: "Phone",
			column: "COMPANY_PHONE",
			type: "VARCHAR",
		},
 {
			name: "Address",
			column: "COMPANY_ADDRESS",
			type: "VARCHAR",
		},
 {
			name: "PostCode",
			column: "COMPANY_POSTCODE",
			type: "VARCHAR",
		},
 {
			name: "VATNO",
			column: "COMPANY_VATNO",
			type: "VARCHAR",
		},
 {
			name: "IBAN",
			column: "COMPANY_IBAN",
			type: "VARCHAR",
		},
 {
			name: "SWIFT",
			column: "COMPANY_SWIFT",
			type: "VARCHAR",
		},
 {
			name: "Bank",
			column: "COMPANY_BANK",
			type: "VARCHAR",
		},
 {
			name: "City",
			column: "COMPANY_CITY",
			type: "VARCHAR",
		},
 {
			name: "Country",
			column: "COMPANY_COUNTRY",
			type: "VARCHAR",
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
		table: "CODBEX_COMPANY",
		entity: entity,
		key: {
			name: "Id",
			column: "COMPANY_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_COMPANY",
		entity: entity,
		key: {
			name: "Id",
			column: "COMPANY_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_COMPANY",
		entity: entity,
		key: {
			name: "Id",
			column: "COMPANY_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_COMPANY"');
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
	let triggerExtensions = extensions.getExtensions("codbex-perseus/Settings/Company");
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
	producer.queue("codbex-perseus/Settings/Company").send(JSON.stringify(data));
}