const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");
const EntityUtils = require("codbex-perseus/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CODBEX_PAYMENT",
	properties: [
		{
			name: "Id",
			column: "PAYMENT_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Date",
			column: "PAYMENT_DATE",
			type: "DATE",
		},
 {
			name: "Valor",
			column: "PAYMENT_VALOR",
			type: "DATE",
		},
 {
			name: "Company",
			column: "PAYMENT_COMPANY",
			type: "INTEGER",
		},
 {
			name: "CompanyIBAN",
			column: "PAYMENT_COMPANYIBAN",
			type: "VARCHAR",
		},
 {
			name: "CounterpartyIBAN",
			column: "PAYMENT_COUNTERPARTYIBAN",
			type: "VARCHAR",
		},
 {
			name: "CounterpartyName",
			column: "PAYMENT_COUNTERPARTYNAME",
			type: "VARCHAR",
		},
 {
			name: "Amount",
			column: "PAYMENT_AMOUNT",
			type: "VARCHAR",
		},
 {
			name: "Currency",
			column: "PAYMENT_CURRENCY",
			type: "INTEGER",
		},
 {
			name: "Reason",
			column: "PAYMENT_REASON",
			type: "VARCHAR",
		},
 {
			name: "Description",
			column: "PAYMENT_DESCRIPTION",
			type: "VARCHAR",
		},
 {
			name: "Direction",
			column: "PAYMENT_DIRECTION",
			type: "INTEGER",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "Date");
		EntityUtils.setDate(e, "Valor");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "Date");
	EntityUtils.setDate(entity, "Valor");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "Date");
	EntityUtils.setLocalDate(entity, "Valor");
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_PAYMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYMENT_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	// EntityUtils.setLocalDate(entity, "Date");
	// EntityUtils.setLocalDate(entity, "Valor");
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_PAYMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYMENT_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_PAYMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYMENT_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PAYMENT"');
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
	let triggerExtensions = extensions.getExtensions("codbex-perseus/Payments/Payment");
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
	producer.queue("codbex-perseus/Payments/Payment").send(JSON.stringify(data));
}