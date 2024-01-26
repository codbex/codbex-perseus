import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

let dao = daoApi.create({
	table: "CODBEX_COMPANY",
	properties: [
		{
			name: "Id",
			column: "COMPANY_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "COMPANY_NAME",
			type: "VARCHAR",
		},
 {
			name: "Email",
			column: "COMPANY_EMAIL",
			type: "VARCHAR",
		},
 {
			name: "Phone",
			column: "COMPANY_PHONE",
			type: "VARCHAR",
		},
 {
			name: "Address",
			column: "COMPANY_ADDRESS",
			type: "VARCHAR",
		},
 {
			name: "PostCode",
			column: "COMPANY_POSTCODE",
			type: "VARCHAR",
		},
 {
			name: "VATNO",
			column: "COMPANY_VATNO",
			type: "VARCHAR",
		},
 {
			name: "IBAN",
			column: "COMPANY_IBAN",
			type: "VARCHAR",
		},
 {
			name: "SWIFT",
			column: "COMPANY_SWIFT",
			type: "VARCHAR",
		},
 {
			name: "Bank",
			column: "COMPANY_BANK",
			type: "VARCHAR",
		},
 {
			name: "City",
			column: "COMPANY_CITY",
			type: "VARCHAR",
		},
 {
			name: "Country",
			column: "COMPANY_COUNTRY",
			type: "VARCHAR",
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
		table: "CODBEX_COMPANY",
		entity: entity,
		key: {
			name: "Id",
			column: "COMPANY_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_COMPANY",
		entity: entity,
		key: {
			name: "Id",
			column: "COMPANY_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_COMPANY",
		entity: entity,
		key: {
			name: "Id",
			column: "COMPANY_ID",
			value: id
		}
	});
}

export const count = () => {
	return dao.count();
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_COMPANY"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Settings/Company", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-perseus/Settings/Company").send(JSON.stringify(data));
}
