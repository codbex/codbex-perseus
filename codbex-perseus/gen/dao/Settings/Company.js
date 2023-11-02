const query = require("db/query");
const producer = require("messaging/producer");
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
		table: "CODBEX_COMPANY",
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
	triggerEvent("Update", {
		table: "CODBEX_COMPANY",
		key: {
			name: "Id",
			column: "COMPANY_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "CODBEX_COMPANY",
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

function triggerEvent(operation, data) {
	producer.queue("codbex-perseus/Settings/Company/" + operation).send(JSON.stringify(data));
}