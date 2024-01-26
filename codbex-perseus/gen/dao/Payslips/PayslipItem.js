import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

let dao = daoApi.create({
	table: "CODBEX_PAYSLIPITEM",
	properties: [
		{
			name: "Id",
			column: "PAYSLIPITEM_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Payslip",
			column: "PAYSLIPITEM_PAYSLIP",
			type: "INTEGER",
		},
 {
			name: "Name",
			column: "PAYSLIPITEM_NAME",
			type: "VARCHAR",
		},
 {
			name: "Amount",
			column: "PAYSLIPITEM_AMOUNT",
			type: "DOUBLE",
		},
 {
			name: "Direction",
			column: "PAYSLIPITEM_DIRECTION",
			type: "INTEGER",
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
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_PAYSLIPITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYSLIPITEM_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_PAYSLIPITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYSLIPITEM_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_PAYSLIPITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYSLIPITEM_ID",
			value: id
		}
	});
}

export const count = (Payslip) => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PAYSLIPITEM" WHERE "PAYSLIPITEM_PAYSLIP" = ?', [Payslip]);
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PAYSLIPITEM"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Payslips/PayslipItem", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-perseus/Payslips/PayslipItem").send(JSON.stringify(data));
}
