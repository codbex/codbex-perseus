const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_SUPPLIER",
	properties: [
		{
			name: "Id",
			column: "SUPPLIER_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "SUPPLIER_NAME",
			type: "VARCHAR",
		},
 {
			name: "Email",
			column: "SUPPLIER_EMAIL",
			type: "VARCHAR",
		},
 {
			name: "Phone",
			column: "SUPPLIER_PHONE",
			type: "VARCHAR",
		},
 {
			name: "Address",
			column: "SUPPLIER_ADDRESS",
			type: "VARCHAR",
		},
 {
			name: "PostCode",
			column: "SUPPLIER_POSTCODE",
			type: "VARCHAR",
		},
 {
			name: "City",
			column: "SUPPLIER_CITY",
			type: "VARCHAR",
		},
 {
			name: "Country",
			column: "SUPPLIER_COUNTRY",
			type: "VARCHAR",
		},
 {
			name: "VATNO",
			column: "SUPPLIER_VATNO",
			type: "VARCHAR",
		},
 {
			name: "IBAN",
			column: "SUPPLIER_IBAN",
			type: "VARCHAR",
		},
 {
			name: "SWIFT",
			column: "SUPPLIER_SWIFT",
			type: "VARCHAR",
		},
 {
			name: "Bank",
			column: "SUPPLIER_BANK",
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
		table: "CODBEX_SUPPLIER",
		entity: entity,
		key: {
			name: "Id",
			column: "SUPPLIER_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_SUPPLIER",
		entity: entity,
		key: {
			name: "Id",
			column: "SUPPLIER_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_SUPPLIER",
		entity: entity,
		key: {
			name: "Id",
			column: "SUPPLIER_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SUPPLIER"');
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
	let triggerExtensions = extensions.getExtensions("codbex-perseus/Partners/Supplier");
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
	producer.queue("codbex-perseus/Partners/Supplier").send(JSON.stringify(data));
}