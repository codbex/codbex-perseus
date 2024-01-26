import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";
import * as EntityUtils from "../utils/EntityUtils";

let dao = daoApi.create({
	table: "CODBEX_SALESORDER",
	properties: [
		{
			name: "Id",
			column: "SALESORDER_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "SALESORDER_NAME",
			type: "VARCHAR",
		},
 {
			name: "Number",
			column: "SALESORDER_NUMBER",
			type: "VARCHAR",
		},
 {
			name: "Date",
			column: "SALESORDER_DATE",
			type: "DATE",
		},
 {
			name: "Customer",
			column: "SALESORDER_CUSTOMER",
			type: "INTEGER",
		},
 {
			name: "Amount",
			column: "SALESORDER_AMOUNT",
			type: "DOUBLE",
		},
 {
			name: "Currency",
			column: "SALESORDER_CURRENCY",
			type: "INTEGER",
		},
 {
			name: "VAT",
			column: "SALESORDER_VAT",
			type: "DOUBLE",
		},
 {
			name: "Total",
			column: "SALESORDER_TOTAL",
			type: "DOUBLE",
		},
 {
			name: "Status",
			column: "SALESORDER_SALESORDERSTATUSID",
			type: "INTEGER",
		}
]
});

export const list = (settings) => {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "Date");
		return e;
	});
}

export const get = (id) => {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "Date");
	return entity;
}

export const create = (entity) => {
	EntityUtils.setLocalDate(entity, "Date");
	entity["VAT"] = entity['Amount'] * 0.2;
	entity["Total"] = entity["Amount"] + entity["VAT"];
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_SALESORDER",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDER_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	// EntityUtils.setLocalDate(entity, "Date");
	entity["VAT"] = entity['Amount'] * 0.2;
	entity["Total"] = entity["Amount"] + entity["VAT"];
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_SALESORDER",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDER_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_SALESORDER",
		entity: entity,
		key: {
			name: "Id",
			column: "SALESORDER_ID",
			value: id
		}
	});
}

export const count = () => {
	return dao.count();
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDER"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/SalesOrders/SalesOrder", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-perseus/SalesOrders/SalesOrder").send(JSON.stringify(data));
}
