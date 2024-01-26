import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";
import * as EntityUtils from "../utils/EntityUtils";

let dao = daoApi.create({
	table: "CODBEX_PROJECT",
	properties: [
		{
			name: "Id",
			column: "PROJECT_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "PROJECT_NAME",
			type: "VARCHAR",
		},
 {
			name: "Customer",
			column: "PROJECT_CUSTOMER",
			type: "INTEGER",
		},
 {
			name: "StartDate",
			column: "PROJECT_STARTDATE",
			type: "DATE",
		},
 {
			name: "EndDate",
			column: "PROJECT_ENDDATE",
			type: "DATE",
		},
 {
			name: "Company",
			column: "PROJECT_COMPANY",
			type: "INTEGER",
		}
]
});

export const list = (settings) => {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "StartDate");
		EntityUtils.setDate(e, "EndDate");
		return e;
	});
}

export const get = (id) => {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "StartDate");
	EntityUtils.setDate(entity, "EndDate");
	return entity;
}

export const create = (entity) => {
	EntityUtils.setLocalDate(entity, "StartDate");
	EntityUtils.setLocalDate(entity, "EndDate");
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_PROJECT",
		entity: entity,
		key: {
			name: "Id",
			column: "PROJECT_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	// EntityUtils.setLocalDate(entity, "StartDate");
	// EntityUtils.setLocalDate(entity, "EndDate");
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_PROJECT",
		entity: entity,
		key: {
			name: "Id",
			column: "PROJECT_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_PROJECT",
		entity: entity,
		key: {
			name: "Id",
			column: "PROJECT_ID",
			value: id
		}
	});
}

export const count = () => {
	return dao.count();
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PROJECT"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Projects/Project", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-perseus/Projects/Project").send(JSON.stringify(data));
}
