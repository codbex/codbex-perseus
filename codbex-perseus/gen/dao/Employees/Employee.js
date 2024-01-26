import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

let dao = daoApi.create({
	table: "CODBEX_EMPLOYEE",
	properties: [
		{
			name: "Id",
			column: "EMPLOYEE_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "EMPLOYEE_NAME",
			type: "VARCHAR",
		},
 {
			name: "Email",
			column: "EMPLOYEE_EMAIL",
			type: "VARCHAR",
		},
 {
			name: "Phone",
			column: "EMPLOYEE_PHONE",
			type: "VARCHAR",
		},
 {
			name: "Address",
			column: "EMPLOYEE_ADDRESS",
			type: "VARCHAR",
		},
 {
			name: "PostCode",
			column: "EMPLOYEE_POSTCODE",
			type: "VARCHAR",
		},
 {
			name: "City",
			column: "EMPLOYEE_CITY",
			type: "VARCHAR",
		},
 {
			name: "Country",
			column: "EMPLOYEE_COUNTRY",
			type: "VARCHAR",
		},
 {
			name: "Team",
			column: "EMPLOYEE_TEAM",
			type: "INTEGER",
		},
 {
			name: "Company",
			column: "EMPLOYEE_COMPANY",
			type: "INTEGER",
		},
 {
			name: "Vacation",
			column: "EMPLOYEE_VACATION",
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
		table: "CODBEX_EMPLOYEE",
		entity: entity,
		key: {
			name: "Id",
			column: "EMPLOYEE_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_EMPLOYEE",
		entity: entity,
		key: {
			name: "Id",
			column: "EMPLOYEE_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_EMPLOYEE",
		entity: entity,
		key: {
			name: "Id",
			column: "EMPLOYEE_ID",
			value: id
		}
	});
}

export const count = () => {
	return dao.count();
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_EMPLOYEE"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Employees/Employee", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-perseus/Employees/Employee").send(JSON.stringify(data));
}
