const query = require("db/query");
const producer = require("messaging/producer");
const extensions = require('extensions/extensions');
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_PURCHASEORDERITEM",
	properties: [
		{
			name: "Id",
			column: "PURCHASEORDERITEM_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "PurchaseOrder",
			column: "PURCHASEORDERITEM_PURCHASEORDER",
			type: "INTEGER",
		},
 {
			name: "Name",
			column: "PURCHASEORDERITEM_NAME",
			type: "VARCHAR",
		},
 {
			name: "Quantity",
			column: "PURCHASEORDERITEM_QUANTITY",
			type: "DOUBLE",
		},
 {
			name: "Price",
			column: "PURCHASEORDERITEM_PRICE",
			type: "DOUBLE",
		},
 {
			name: "Amount",
			column: "PURCHASEORDERITEM_AMOUNT",
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
		table: "CODBEX_PURCHASEORDERITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "PURCHASEORDERITEM_ID",
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
		table: "CODBEX_PURCHASEORDERITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "PURCHASEORDERITEM_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_PURCHASEORDERITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "PURCHASEORDERITEM_ID",
			value: id
		}
	});
};

exports.count = function (PurchaseOrder) {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PURCHASEORDERITEM" WHERE "PURCHASEORDERITEM_PURCHASEORDER" = ?', [PurchaseOrder]);
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PURCHASEORDERITEM"');
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
	let triggerExtensions = extensions.getExtensions("codbex-perseus/PurchaseOrders/PurchaseOrderItem");
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
	producer.queue("codbex-perseus/PurchaseOrders/PurchaseOrderItem").send(JSON.stringify(data));
}