import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

let dao = daoApi.create({
	table: "CODBEX_SALARY",
	properties: [
		{
			name: "Id",
			column: "SALARY_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "SALARY_NAME",
			type: "VARCHAR",
		},
 {
			name: "Employee",
			column: "SALARY_EMPLOYEE",
			type: "INTEGER",
		},
 {
			name: "Company",
			column: "SALARY_COMPANY",
			type: "INTEGER",
		},
 {
			name: "Currency",
			column: "SALARY_CURRENCY",
			type: "INTEGER",
		},
 {
			name: "Net",
			column: "SALARY_NET",
			type: "DOUBLE",
		},
 {
			name: "Gross",
			column: "SALARY_GROSS",
			type: "DOUBLE",
		},
 {
			name: "Total",
			column: "SALARY_TOTAL",
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
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_SALARY",
		entity: entity,
		key: {
			name: "Id",
			column: "SALARY_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_SALARY",
		entity: entity,
		key: {
			name: "Id",
			column: "SALARY_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_SALARY",
		entity: entity,
		key: {
			name: "Id",
			column: "SALARY_ID",
			value: id
		}
	});
}

export const count = () => {
	return dao.count();
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALARY"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Salaries/Salary", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-perseus/Salaries/Salary").send(JSON.stringify(data));
}
