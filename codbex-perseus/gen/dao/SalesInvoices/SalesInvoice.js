const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");
const EntityUtils = require("codbex-perseus/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CODBEX_SALESINVOICE",
	properties: [
		{
			name: "Id",
			column: "SALESINVOICE_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "SALESINVOICE_NAME",
			type: "VARCHAR",
		},
 {
			name: "Number",
			column: "SALESINVOICE_NUMBER",
			type: "VARCHAR",
		},
 {
			name: "Date",
			column: "SALESINVOICE_DATE",
			type: "DATE",
		},
 {
			name: "Due",
			column: "SALESINVOICE_DUE",
			type: "DATE",
		},
 {
			name: "Customer",
			column: "SALESINVOICE_CUSTOMER",
			type: "INTEGER",
		},
 {
			name: "SalesOrder",
			column: "SALESINVOICE_SALESORDER",
			type: "INTEGER",
		},
 {
			name: "Amount",
			column: "SALESINVOICE_AMOUNT",
			type: "DOUBLE",
		},
 {
			name: "Currency",
			column: "SALESINVOICE_CURRENCY",
			type: "INTEGER",
		},
 {
			name: "VAT",
			column: "SALESINVOICE_VAT",
			type: "DOUBLE",
		},
 {
			name: "Discount",
			column: "SALESINVOICE_DISCOUNT",
			type: "DOUBLE",
		},
 {
			name: "Taxes",
			column: "SALESINVOICE_TAXES",
			type: "DOUBLE",
		},
 {
			name: "Total",
			column: "SALESINVOICE_TOTAL",
			type: "DOUBLE",
		},
 {
			name: "Conditions",
			column: "SALESINVOICE_CONDITIONS",
			type: "VARCHAR",
		},
 {
			name: "PaymentMethod",
			column: "SALESINVOICE_PAYMENTMETHOD",
			type: "VARCHAR",
		},
 {
			name: "SentMethod",
			column: "SALESINVOICE_SENTMETHOD",
			type: "VARCHAR",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "Date");
		EntityUtils.setDate(e, "Due");
		return e;
	});
};

exports.get = function(id) {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "Date");
	EntityUtils.setDate(entity, "Due");
	return entity;
};

exports.create = function(entity) {
	EntityUtils.setLocalDate(entity, "Date");
	EntityUtils.setLocalDate(entity, "Due");
	entity["VAT"] = entity['Amount'] * 0.2;
	entity["Total"] = entity["Amount"] + entity["VAT"] - (entity["Amount"] * entity["Discount"] ? entity["Discount"] : 0) / 100 + (entity["Taxes"] ? entity["Taxes"] : 0);
	let id = dao.insert(entity);
	triggerEvent("Create", {
		table: "CODBEX_SALESINVOICE",
		key: {
			name: "Id",
			column: "SALESINVOICE_ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	// EntityUtils.setLocalDate(entity, "Date");
	// EntityUtils.setLocalDate(entity, "Due");
	entity["VAT"] = entity['Amount'] * 0.2;
	entity["Total"] = entity["Amount"] + entity["VAT"] - (entity["Amount"] * entity["Discount"] ? entity["Discount"] : 0) / 100 + (entity["Taxes"] ? entity["Taxes"] : 0);
	dao.update(entity);
	triggerEvent("Update", {
		table: "CODBEX_SALESINVOICE",
		key: {
			name: "Id",
			column: "SALESINVOICE_ID",
			value: entity.Id
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "CODBEX_SALESINVOICE",
		key: {
			name: "Id",
			column: "SALESINVOICE_ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESINVOICE"');
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
	producer.queue("codbex-perseus/SalesInvoices/SalesInvoice/" + operation).send(JSON.stringify(data));
}