const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_SALESINVOICEITEM",
	properties: [
		{
			name: "Id",
			column: "SALESINVOICEITEM_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "SalesInvoice",
			column: "SALESINVOICEITEM_SALESINVOICE",
			type: "INTEGER",
		},
 {
			name: "Name",
			column: "SALESINVOICEITEM_NAME",
			type: "VARCHAR",
		},
 {
			name: "Quantity",
			column: "SALESINVOICEITEM_QUANTITY",
			type: "DOUBLE",
		},
 {
			name: "Price",
			column: "SALESINVOICEITEM_PRICE",
			type: "DOUBLE",
		},
 {
			name: "Amount",
			column: "SALESINVOICEITEM_AMOUNT",
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
	entity["Amount"] = entity["Quantity"] * entity["Price"];
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_SALESINVOICEITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESINVOICEITEM_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	entity["Amount"] = entity["Quantity"] * entity["Price"];
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_SALESINVOICEITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESINVOICEITEM_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_SALESINVOICEITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESINVOICEITEM_ID",
			value: id
		}
	});
};

exports.count = function (SalesInvoice) {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESINVOICEITEM" WHERE "SALESINVOICEITEM_SALESINVOICE" = ?', [SalesInvoice]);
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESINVOICEITEM"');
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
	let triggerExtensions = extensions.getExtensions("codbex-perseus/SalesInvoices/SalesInvoiceItem");
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
	producer.queue("codbex-perseus/SalesInvoices/SalesInvoiceItem").send(JSON.stringify(data));
}