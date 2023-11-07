const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_PURCHASEINVOICEITEM",
	properties: [
		{
			name: "Id",
			column: "PURCHASEINVOICEITEM_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "PurchaseInvoiceId",
			column: "PURCHASEINVOICEITEM_PURCHASEINVOICEID",
			type: "INTEGER",
		},
 {
			name: "Name",
			column: "PURCHASEINVOICEITEM_NAME",
			type: "VARCHAR",
		},
 {
			name: "Quantity",
			column: "PURCHASEINVOICEITEM_QUANTITY",
			type: "DOUBLE",
		},
 {
			name: "Price",
			column: "PURCHASEINVOICEITEM_PRICE",
			type: "DOUBLE",
		},
 {
			name: "Amount",
			column: "PURCHASEINVOICEITEM_AMOUNT",
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
	triggerEvent("Create", {
		table: "CODBEX_PURCHASEINVOICEITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "PURCHASEINVOICEITEM_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	entity["Amount"] = entity["Quantity"] * entity["Price"];
	dao.update(entity);
	triggerEvent("Update", {
		table: "CODBEX_PURCHASEINVOICEITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "PURCHASEINVOICEITEM_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent("Delete", {
		table: "CODBEX_PURCHASEINVOICEITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "PURCHASEINVOICEITEM_ID",
			value: id
		}
	});
};

exports.count = function (PurchaseInvoiceId) {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PURCHASEINVOICEITEM" WHERE "PURCHASEINVOICEITEM_PURCHASEINVOICEID" = ?', [PurchaseInvoiceId]);
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PURCHASEINVOICEITEM"');
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
	producer.queue("codbex-perseus/PurchaseInvoices/PurchaseInvoiceItem/" + operation).send(JSON.stringify(data));
}