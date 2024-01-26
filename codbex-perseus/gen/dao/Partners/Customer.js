import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

let dao = daoApi.create({
	table: "CODBEX_CUSTOMER",
	properties: [
		{
			name: "Id",
			column: "CUSTOMER_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "Name",
			column: "CUSTOMER_NAME",
			type: "VARCHAR",
		},
 {
			name: "Contact",
			column: "CUSTOMER_CONTACT",
			type: "VARCHAR",
		},
 {
			name: "Email",
			column: "CUSTOMER_EMAIL",
			type: "VARCHAR",
		},
 {
			name: "Phone",
			column: "CUSTOMER_PHONE",
			type: "VARCHAR",
		},
 {
			name: "Address",
			column: "CUSTOMER_ADDRESS",
			type: "VARCHAR",
		},
 {
			name: "PostCode",
			column: "CUSTOMER_POSTCODE",
			type: "VARCHAR",
		},
 {
			name: "City",
			column: "CUSTOMER_CITY",
			type: "VARCHAR",
		},
 {
			name: "Country",
			column: "CUSTOMER_COUNTRY",
			type: "VARCHAR",
		},
 {
			name: "IBAN",
			column: "CUSTOMER_IBAN",
			type: "VARCHAR",
		},
 {
			name: "VATNO",
			column: "CUSTOMER_VATNO",
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
		table: "CODBEX_CUSTOMER",
		entity: entity,
		key: {
			name: "Id",
			column: "CUSTOMER_ID",
			value: id
		}
	});
	return id;
}

export const update = (entity) => {
	dao.update(entity);
	triggerEvent({
		operation: "update",
		table: "CODBEX_CUSTOMER",
		entity: entity,
		key: {
			name: "Id",
			column: "CUSTOMER_ID",
			value: entity.Id
		}
	});
}

export const remove = (id) => {
	let entity = dao.find(id);
	dao.remove(id);
	triggerEvent({
		operation: "delete",
		table: "CODBEX_CUSTOMER",
		entity: entity,
		key: {
			name: "Id",
			column: "CUSTOMER_ID",
			value: id
		}
	});
}

export const count = () => {
	return dao.count();
}

export const customDataCount = () => {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CUSTOMER"');
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
	const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Partners/Customer", ["trigger"]);
	triggerExtensions.forEach(triggerExtension => {
		try {
			triggerExtension.trigger(data);
		} catch (error) {
			console.error(error);
		}			
	});
	producer.queue("codbex-perseus/Partners/Customer").send(JSON.stringify(data));
}
