const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");

let dao = daoApi.create({
	table: "CODBEX_PURCHASEINVOICEPAID",
	properties: [
		{
			name: "Id",
			column: "PAYMENTSENT_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Payment",
			column: "PAYMENTSENT_PAYMENT",
			type: "INTEGER",
		},
 {
			name: "PurchaseInvoice",
			column: "PAYMENTSENT_PURCHASEINVOICE",
			type: "INTEGER",
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
		table: "CODBEX_PURCHASEINVOICEPAID",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYMENTSENT_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent("Update", {
		table: "CODBEX_PURCHASEINVOICEPAID",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYMENTSENT_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent("Delete", {
		table: "CODBEX_PURCHASEINVOICEPAID",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYMENTSENT_ID",
			value: id
		}
	});
};

exports.count = function (Payment) {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PURCHASEINVOICEPAID" WHERE "PAYMENTSENT_PAYMENT" = ?', [Payment]);
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PURCHASEINVOICEPAID"');
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
	producer.queue("codbex-perseus/Payments/PurchaseInvoicePaid/" + operation).send(JSON.stringify(data));
}