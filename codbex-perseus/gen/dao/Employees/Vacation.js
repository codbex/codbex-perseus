import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";
import * as EntityUtils from "../utils/EntityUtils";

let dao = daoApi.create({
	table: "CODBEX_VACATION",
	properties: [
		{
			name: "Id",
			column: "VACATION_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Date",
			column: "VACATION_DATE",
			type: "DATE",
		},
 {
			name: "Employee",
			column: "VACATION_EMPLOYEE",
			type: "INTEGER",
		},
 {
			name: "Reason",
			column: "VACATION_REASON",
			type: "VARCHAR",
		},
 {
			name: "Ratio",
			column: "VACATION_RATIO",
			type: "INTEGER",
		},
 {
			name: "VacationTypeId",
			column: "VACATION_VACATIONTYPEID",
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
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_VACATION",
		entity: entity,
		key: {
			name: "Id",
			column: "VACATION_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	// EntityUtils.setLocalDate(entity, "Date");
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_VACATION",
		entity: entity,
		key: {
			name: "Id",
			column: "VACATION_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_VACATION",
		entity: entity,
		key: {
			name: "Id",
			column: "VACATION_ID",
			value: id
		}
	});
}

export const count = () => {
	return dao.count();
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_VACATION"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Employees/Vacation", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-perseus/Employees/Vacation").send(JSON.stringify(data));
}
