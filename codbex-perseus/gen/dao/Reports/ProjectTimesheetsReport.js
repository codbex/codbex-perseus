const query = require("db/query");
const producer = require("messaging/producer");
const daoApi = require("db/dao");
const EntityUtils = require("codbex-perseus/gen/dao/utils/EntityUtils");

let dao = daoApi.create({
	table: "CODBEX_PROJECTTIMESHEETSREPORT",
	properties: [
		{
			name: "Id",
			column: "PROJECTTIMESHEETS_ID",
			type: "INTEGER",
			id: true,
			autoIncrement: true,
		},
 {
			name: "StartDate",
			column: "PROJECTTIMESHEETS_STARTDATE",
			type: "DATE",
		},
 {
			name: "EndDate",
			column: "PROJECTTIMESHEETS_ENDDATE",
			type: "DATE",
		},
 {
			name: "Project",
			column: "PROJECTTIMESHEETS_PROJECT",
			type: "INTEGER",
		}
]
});

exports.list = function(settings) {
	return dao.list(settings).map(function(e) {
		EntityUtils.setDate(e, "StartDate");
		EntityUtils.setDate(e, "EndDate");
		return e;
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	let resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PROJECTTIMESHEETSREPORT"');
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
};

function triggerEvent(operation, data) {
	producer.queue("codbex-perseus/Reports/ProjectTimesheetsReport/" + operation).send(JSON.stringify(data));
}