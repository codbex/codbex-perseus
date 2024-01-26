import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

let dao = daoApi.create({
	table: "CODBEX_SALARYITEM",
	properties: [
		{
			name: "Id",
			column: "SALARYITEM_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Salary",
			column: "SALARYITEM_SALARY",
			type: "INTEGER",
		},
 {
			name: "Name",
			column: "SALARYITEM_NAME",
			type: "VARCHAR",
		},
 {
			name: "Amount",
			column: "SALARYITEM_AMOUNT",
			type: "DOUBLE",
		},
 {
			name: "Direction",
			column: "SALARYITEM_DIRECTION",
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
		table: "CODBEX_SALARYITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "SALARYITEM_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_SALARYITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "SALARYITEM_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_SALARYITEM",
		entity: entity,
		key: {
			name: "Id",
			column: "SALARYITEM_ID",
			value: id
		}
	});
}

export const count = (Salary) => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALARYITEM" WHERE "SALARYITEM_SALARY" = ?', [Salary]);
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALARYITEM"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Salaries/SalaryItem", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-perseus/Salaries/SalaryItem").send(JSON.stringify(data));
}
