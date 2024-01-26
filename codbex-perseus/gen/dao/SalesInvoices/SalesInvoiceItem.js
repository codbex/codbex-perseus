import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

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

export const list = (settings) => {
	return dao.list(settings);
}

export const get = (id) => {
	return dao.find(id);
}

export const create = (entity) => {
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
}

export const update = (entity) => {
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
}

export const remove = (id) => {
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
}

export const count = (SalesInvoice) => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESINVOICEITEM" WHERE "SALESINVOICEITEM_SALESINVOICE" = ?', [SalesInvoice]);
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESINVOICEITEM"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/SalesInvoices/SalesInvoiceItem", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-perseus/SalesInvoices/SalesInvoiceItem").send(JSON.stringify(data));
}
