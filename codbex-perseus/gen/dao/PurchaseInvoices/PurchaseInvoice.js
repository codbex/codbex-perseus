const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");
const EntityUtils = require("codbex-perseus/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CODBEX_PURCHASEINVOICE",
	properties: [
		{
			name: "Id",
			column: "PURCHASEINVOICE_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "PURCHASEINVOICE_NAME",
			type: "VARCHAR",
		},
 {
			name: "Number",
			column: "PURCHASEINVOICE_NUMBER",
			type: "VARCHAR",
		},
 {
			name: "Date",
			column: "PURCHASEINVOICE_DATE",
			type: "DATE",
		},
 {
			name: "Supplier",
			column: "PURCHASEINVOICE_SUPPLIER",
			type: "INTEGER",
		},
 {
			name: "PurchaseOrder",
			column: "PURCHASEINVOICE_PURCHASEORDER",
			type: "INTEGER",
		},
 {
			name: "Description",
			column: "PURCHASEINVOICE_DESCRIPTION",
			type: "VARCHAR",
		},
 {
			name: "Amount",
			column: "PURCHASEINVOICE_AMOUNT",
			type: "DOUBLE",
		},
 {
			name: "Currency",
			column: "PURCHASEINVOICE_CURRENCY",
			type: "INTEGER",
		},
 {
			name: "VAT",
			column: "PURCHASEINVOICE_VAT",
			type: "DOUBLE",
		},
 {
			name: "Total",
			column: "PURCHASEINVOICE_TOTAL",
			type: "DOUBLE",
		},
 {
			name: "Status",
			column: "PURCHASEINVOICE_STATUS",
			type: "INTEGER",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "Date");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "Date");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "Date");
	entity["VAT"] = entity['Amount'] * 0.2;
	entity["Total"] = entity["Amount"] + entity["VAT"];
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_PURCHASEINVOICE",
		entity: entity,
		key: {
			name: "Id",
			column: "PURCHASEINVOICE_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	// EntityUtils.setLocalDate(entity, "Date");
	entity["VAT"] = entity['Amount'] * 0.2;
	entity["Total"] = entity["Amount"] + entity["VAT"];
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_PURCHASEINVOICE",
		entity: entity,
		key: {
			name: "Id",
			column: "PURCHASEINVOICE_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_PURCHASEINVOICE",
		entity: entity,
		key: {
			name: "Id",
			column: "PURCHASEINVOICE_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PURCHASEINVOICE"');
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
	let triggerExtensions = extensions.getExtensions("codbex-perseus/PurchaseInvoices/PurchaseInvoice");
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
	producer.queue("codbex-perseus/PurchaseInvoices/PurchaseInvoice").send(JSON.stringify(data));
}