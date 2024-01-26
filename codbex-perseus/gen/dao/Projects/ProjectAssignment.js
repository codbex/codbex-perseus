import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";
import * as EntityUtils from "../utils/EntityUtils";

let dao = daoApi.create({
	table: "CODBEX_PROJECTASSIGNMENT",
	properties: [
		{
			name: "Id",
			column: "PROJECTASSIGNMENT_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "PROJECTASSIGNMENT_NAME",
			type: "VARCHAR",
		},
 {
			name: "Employee",
			column: "PROJECTASSIGNMENT_EMPLOYEE",
			type: "INTEGER",
		},
 {
			name: "Project",
			column: "PROJECTASSIGNMENT_PROJECT",
			type: "INTEGER",
		},
 {
			name: "Position",
			column: "PROJECTASSIGNMENT_POSITION",
			type: "INTEGER",
		},
 {
			name: "HourlyRate",
			column: "PROJECTASSIGNMENT_HOURLYRATE",
			type: "DOUBLE",
		},
 {
			name: "StartDate",
			column: "PROJECTASSIGNMENT_STARTDATE",
			type: "DATE",
		},
 {
			name: "EndDate",
			column: "PROJECTASSIGNMENT_ENDDATE",
			type: "DATE",
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
		table: "CODBEX_PROJECTASSIGNMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "PROJECTASSIGNMENT_ID",
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
		table: "CODBEX_PROJECTASSIGNMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "PROJECTASSIGNMENT_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_PROJECTASSIGNMENT",
		entity: entity,
		key: {
			name: "Id",
			column: "PROJECTASSIGNMENT_ID",
			value: id
		}
	});
}

export const count = (Project) => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PROJECTASSIGNMENT" WHERE "PROJECTASSIGNMENT_PROJECT" = ?', [Project]);
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
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PROJECTASSIGNMENT"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Projects/ProjectAssignment", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-perseus/Projects/ProjectAssignment").send(JSON.stringify(data));
}
