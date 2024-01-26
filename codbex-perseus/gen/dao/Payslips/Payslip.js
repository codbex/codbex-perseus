import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";
import * as EntityUtils from "../utils/EntityUtils";

let dao = daoApi.create({
	table: "CODBEX_PAYSLIP",
	properties: [
		{
			name: "Id",
			column: "PAYSLIP_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "PAYSLIP_NAME",
			type: "VARCHAR",
		},
 {
			name: "Employee",
			column: "PAYSLIP_EMPLOYEE",
			type: "INTEGER",
		},
 {
			name: "Company",
			column: "PAYSLIP_COMPANY",
			type: "INTEGER",
		},
 {
			name: "StartDate",
			column: "PAYSLIP_STARTDATE",
			type: "DATE",
		},
 {
			name: "EndDate",
			column: "PAYSLIP_ENDDATE",
			type: "DATE",
		},
 {
			name: "Currency",
			column: "PAYSLIP_CURRENCY",
			type: "INTEGER",
		},
 {
			name: "Net",
			column: "PAYSLIP_NET",
			type: "DOUBLE",
		},
 {
			name: "Gross",
			column: "PAYSLIP_GROSS",
			type: "DOUBLE",
		},
 {
			name: "Total",
			column: "PAYSLIP_TOTAL",
			type: "DOUBLE",
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
		table: "CODBEX_PAYSLIP",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYSLIP_ID",
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
		table: "CODBEX_PAYSLIP",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYSLIP_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_PAYSLIP",
		entity: entity,
		key: {
			name: "Id",
			column: "PAYSLIP_ID",
			value: id
		}
	});
}

export const count = () => {
	return dao.count();
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PAYSLIP"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Payslips/Payslip", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-perseus/Payslips/Payslip").send(JSON.stringify(data));
}
