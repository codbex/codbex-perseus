import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";
import * as EntityUtils from "../utils/EntityUtils";

let dao = daoApi.create({
	table: "CODBEX_PAYMENT",
	properties: [
		{
			name: "Id",
			column: "PAYMENT_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Date",
			column: "PAYMENT_DATE",
			type: "DATE",
		},
 {
			name: "Valor",
			column: "PAYMENT_VALOR",
			type: "DATE",
		},
 {
			name: "Company",
			column: "PAYMENT_COMPANY",
			type: "INTEGER",
		},
 {
			name: "CompanyIBAN",
			column: "PAYMENT_COMPANYIBAN",
			type: "VARCHAR",
		},
 {
			name: "CounterpartyIBAN",
			column: "PAYMENT_COUNTERPARTYIBAN",
			type: "VARCHAR",
		},
 {
			name: "CounterpartyName",
			column: "PAYMENT_COUNTERPARTYNAME",
			type: "VARCHAR",
		},
 {
			name: "Amount",
			column: "PAYMENT_AMOUNT",
			type: "VARCHAR",
		},
 {
			name: "Currency",
			column: "PAYMENT_CURRENCY",
			type: "INTEGER",
		},
 {
			name: "Reason",
			column: "PAYMENT_REASON",
			type: "VARCHAR",
		},
 {
			name: "Description",
			column: "PAYMENT_DESCRIPTION",
			type: "VARCHAR",
		},
 {
			name: "Direction",
			column: "PAYMENT_DIRECTION",
			type: "INTEGER",
		}
]
});

export const list = (settings) => {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "Date");
		EntityUtils.setDate(e, "Valor");
		return e;
	});
}

export const get = (id) => {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "Date");
	EntityUtils.setDate(entity, "Valor");
	return entity;
}

export const create = (entity) => {
	EntityUtils.setLocalDate(entity, "Date");
	EntityUtils.setLocalDate(entity, "Valor");
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_PAYMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYMENT_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	// EntityUtils.setLocalDate(entity, "Date");
	// EntityUtils.setLocalDate(entity, "Valor");
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_PAYMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYMENT_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_PAYMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYMENT_ID",
			value: id
		}
	});
}

export const count = () => {
	return dao.count();
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PAYMENT"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Payments/Payment", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-perseus/Payments/Payment").send(JSON.stringify(data));
}
