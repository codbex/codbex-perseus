const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");
const EntityUtils = require("codbex-perseus/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CODBEX_PURCHASEORDER",
	properties: [
		{
			name: "Id",
			column: "PURCHASEORDER_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "PURCHASEORDER_NAME",
			type: "VARCHAR",
		},
 {
			name: "Number",
			column: "PURCHASEORDER_NUMBER",
			type: "VARCHAR",
		},
 {
			name: "Date",
			column: "PURCHASEORDER_DATE",
			type: "DATE",
		},
 {
			name: "Supplier",
			column: "PURCHASEORDER_SUPPLIER",
			type: "INTEGER",
		},
 {
			name: "Description",
			column: "PURCHASEORDER_DESCRIPTION",
			type: "VARCHAR",
		},
 {
			name: "Amount",
			column: "PURCHASEORDER_AMOUNT",
			type: "DOUBLE",
		},
 {
			name: "Currency",
			column: "PURCHASEORDER_CURRENCY",
			type: "INTEGER",
		},
 {
			name: "VAT",
			column: "PURCHASEORDER_VAT",
			type: "DOUBLE",
		},
 {
			name: "Total",
			column: "PURCHASEORDER_TOTAL",
			type: "DOUBLE",
		},
 {
			name: "Status",
			column: "PURCHASEORDER_STATUS",
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
		table: "CODBEX_PURCHASEORDER",
		entity: entity,
		key: {
			name: "Id",
			column: "PURCHASEORDER_ID",
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
		table: "CODBEX_PURCHASEORDER",
		entity: entity,
		key: {
			name: "Id",
			column: "PURCHASEORDER_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_PURCHASEORDER",
		entity: entity,
		key: {
			name: "Id",
			column: "PURCHASEORDER_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PURCHASEORDER"');
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
	let triggerExtensions = extensions.getExtensions("codbex-perseus/PurchaseOrders/PurchaseOrder");
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
	producer.queue("codbex-perseus/PurchaseOrders/PurchaseOrder").send(JSON.stringify(data));
}