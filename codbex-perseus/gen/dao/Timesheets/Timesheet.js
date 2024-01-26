import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";
import * as EntityUtils from "../utils/EntityUtils";

let dao = daoApi.create({
	table: "CODBEX_TIMESHEET",
	properties: [
		{
			name: "Id",
			column: "TIMESHEET_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "TIMESHEET_NAME",
			type: "VARCHAR",
		},
 {
			name: "StartPeriod",
			column: "TIMESHEET_STARTPERIOD",
			type: "DATE",
		},
 {
			name: "EndPeriod",
			column: "TIMESHEET_ENDPERIOD",
			type: "DATE",
		},
 {
			name: "ProjectAssignment",
			column: "TIMESHEET_PROJECTASSIGNMENT",
			type: "INTEGER",
		},
 {
			name: "Hours",
			column: "TIMESHEET_HOURS",
			type: "INTEGER",
		},
 {
			name: "Rate",
			column: "TIMESHEET_RATE",
			type: "DOUBLE",
		}
]
});

export const list = (settings) => {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "StartPeriod");
		EntityUtils.setDate(e, "EndPeriod");
		return e;
	});
}

export const get = (id) => {
	let entity = dao.find(id);
	EntityUtils.setDate(entity, "StartPeriod");
	EntityUtils.setDate(entity, "EndPeriod");
	return entity;
}

export const create = (entity) => {
	EntityUtils.setLocalDate(entity, "StartPeriod");
	EntityUtils.setLocalDate(entity, "EndPeriod");
	let id = dao.insert(entity);
	triggerEvent({
		operation: "create",
		table: "CODBEX_TIMESHEET",
		entity: entity,
		key: {
			name: "Id",
			column: "TIMESHEET_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	// EntityUtils.setLocalDate(entity, "StartPeriod");
	// EntityUtils.setLocalDate(entity, "EndPeriod");
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_TIMESHEET",
		entity: entity,
		key: {
			name: "Id",
			column: "TIMESHEET_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_TIMESHEET",
		entity: entity,
		key: {
			name: "Id",
			column: "TIMESHEET_ID",
			value: id
		}
	});
}

export const count = () => {
	return dao.count();
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_TIMESHEET"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Timesheets/Timesheet", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-perseus/Timesheets/Timesheet").send(JSON.stringify(data));
}
