const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_SALESINVOICEPAYMENT",
	properties: [
		{
			name: "Id",
			column: "SALESINVOICEPAYMENT_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "SalesInvoice",
			column: "SALESINVOICEPAYMENT_SALESINVOICE",
			type: "INTEGER",
		},
 {
			name: "Payment",
			column: "SALESINVOICEPAYMENT_PAYMENT",
			type: "INTEGER",
		},
 {
			name: "Amount",
			column: "SALESINVOICEPAYMENT_AMOUNT",
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
		table: "CODBEX_SALESINVOICEPAYMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESINVOICEPAYMENT_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_SALESINVOICEPAYMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESINVOICEPAYMENT_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_SALESINVOICEPAYMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESINVOICEPAYMENT_ID",
			value: id
		}
	});
};

exports.count = function (SalesInvoice) {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESINVOICEPAYMENT" WHERE "SALESINVOICEPAYMENT_SALESINVOICE" = ?', [SalesInvoice]);
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESINVOICEPAYMENT"');
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
	let triggerExtensions = extensions.getExtensions("codbex-perseus/SalesInvoices/SalesInvoicePayment");
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
	producer.queue("codbex-perseus/SalesInvoices/SalesInvoicePayment").send(JSON.stringify(data));
}