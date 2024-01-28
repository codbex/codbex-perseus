import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";
import * as EntityUtils from "../utils/EntityUtils";

let dao = daoApi.create({
	table: "CODBEX_PAYMENTENTRY",
	properties: [
		{
			name: "Id",
			column: "PAYMENTENTRY_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Date",
			column: "PAYMENTENTRY_DATE",
			type: "DATE",
		},
 {
			name: "Valor",
			column: "PAYMENTENTRY_VALOR",
			type: "DATE",
		},
 {
			name: "Company",
			column: "PAYMENTENTRY_COMPANY",
			type: "INTEGER",
		},
 {
			name: "CompanyIBAN",
			column: "PAYMENTENTRY_COMPANYIBAN",
			type: "VARCHAR",
		},
 {
			name: "CounterpartyIBAN",
			column: "PAYMENTENTRY_COUNTERPARTYIBAN",
			type: "VARCHAR",
		},
 {
			name: "CounterpartyName",
			column: "PAYMENTENTRY_COUNTERPARTYNAME",
			type: "VARCHAR",
		},
 {
			name: "Amount",
			column: "PAYMENTENTRY_AMOUNT",
			type: "VARCHAR",
		},
 {
			name: "Currency",
			column: "PAYMENTENTRY_CURRENCY",
			type: "INTEGER",
		},
 {
			name: "Reason",
			column: "PAYMENTENTRY_REASON",
			type: "VARCHAR",
		},
 {
			name: "Description",
			column: "PAYMENTENTRY_DESCRIPTION",
			type: "VARCHAR",
		},
 {
			name: "Direction",
			column: "PAYMENTENTRY_DIRECTION",
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
		table: "CODBEX_PAYMENTENTRY",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYMENTENTRY_ID",
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
		table: "CODBEX_PAYMENTENTRY",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYMENTENTRY_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_PAYMENTENTRY",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYMENTENTRY_ID",
			value: id
		}
	});
}

export const count = () => {
	return dao.count();
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PAYMENTENTRY"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Payments/PaymentEntry", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-perseus/Payments/PaymentEntry").send(JSON.stringify(data));
}
