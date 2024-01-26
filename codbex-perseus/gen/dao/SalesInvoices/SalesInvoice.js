import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";
import * as EntityUtils from "../utils/EntityUtils";

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
		},
 {
			name: "Status",
			column: "SALESINVOICE_STATUS",
			type: "INTEGER",
		}
]
});

export const list = (settings) => {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "Date");
		EntityUtils.setDate(e, "Due");
		return e;
	});
}

export const get = (id) => {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "Date");
	EntityUtils.setDate(entity, "Due");
	return entity;
}

export const create = (entity) => {
	EntityUtils.setLocalDate(entity, "Date");
	EntityUtils.setLocalDate(entity, "Due");
	entity["VAT"] = entity['Amount'] * 0.2;
	entity["Total"] = entity["Amount"] + entity["VAT"] - (entity["Amount"] * entity["Discount"] ? entity["Discount"] : 0) / 100 + (entity["Taxes"] ? entity["Taxes"] : 0);
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_SALESINVOICE",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESINVOICE_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	// EntityUtils.setLocalDate(entity, "Date");
	// EntityUtils.setLocalDate(entity, "Due");
	entity["VAT"] = entity['Amount'] * 0.2;
	entity["Total"] = entity["Amount"] + entity["VAT"] - (entity["Amount"] * entity["Discount"] ? entity["Discount"] : 0) / 100 + (entity["Taxes"] ? entity["Taxes"] : 0);
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_SALESINVOICE",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESINVOICE_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_SALESINVOICE",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESINVOICE_ID",
			value: id
		}
	});
}

export const count = () => {
	return dao.count();
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESINVOICE"');
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
}


const triggerEvent = async(data) => {
	const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/SalesInvoices/SalesInvoice", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-perseus/SalesInvoices/SalesInvoice").send(JSON.stringify(data));
}
