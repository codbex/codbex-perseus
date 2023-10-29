const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");

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
			type: "VARCHAR",
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
		table: "CODBEX_PURCHASEORDER",
		key: {
			name: "Id",
			column: "PURCHASEORDER_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent("Update", {
		table: "CODBEX_PURCHASEORDER",
		key: {
			name: "Id",
			column: "PURCHASEORDER_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "CODBEX_PURCHASEORDER",
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

function triggerEvent(operation, data) {
	producer.queue("codbex-perseus/PurchaseOrders/PurchaseOrder/" + operation).send(JSON.stringify(data));
}