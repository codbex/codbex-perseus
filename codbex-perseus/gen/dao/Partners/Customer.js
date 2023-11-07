const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_CUSTOMER",
	properties: [
		{
			name: "Id",
			column: "CUSTOMER_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "CUSTOMER_NAME",
			type: "VARCHAR",
		},
 {
			name: "Contact",
			column: "CUSTOMER_CONTACT",
			type: "VARCHAR",
		},
 {
			name: "Email",
			column: "CUSTOMER_EMAIL",
			type: "VARCHAR",
		},
 {
			name: "Phone",
			column: "CUSTOMER_PHONE",
			type: "VARCHAR",
		},
 {
			name: "Address",
			column: "CUSTOMER_ADDRESS",
			type: "VARCHAR",
		},
 {
			name: "PostCode",
			column: "CUSTOMER_POSTCODE",
			type: "VARCHAR",
		},
 {
			name: "City",
			column: "CUSTOMER_CITY",
			type: "VARCHAR",
		},
 {
			name: "Country",
			column: "CUSTOMER_COUNTRY",
			type: "VARCHAR",
		},
 {
			name: "IBAN",
			column: "CUSTOMER_IBAN",
			type: "VARCHAR",
		},
 {
			name: "VATNO",
			column: "CUSTOMER_VATNO",
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
	triggerEvent("Create", {
		table: "CODBEX_CUSTOMER",
		entity: entity,
		key: {
			name: "Id",
			column: "CUSTOMER_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent("Update", {
		table: "CODBEX_CUSTOMER",
		entity: entity,
		key: {
			name: "Id",
			column: "CUSTOMER_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent("Delete", {
		table: "CODBEX_CUSTOMER",
		entity: entity,
		key: {
			name: "Id",
			column: "CUSTOMER_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CUSTOMER"');
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
	producer.queue("codbex-perseus/Partners/Customer/" + operation).send(JSON.stringify(data));
}