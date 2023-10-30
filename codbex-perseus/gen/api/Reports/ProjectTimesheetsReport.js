const rs = require("http/rs");
const dao = require("codbex-perseus/gen/dao/Reports/ProjectTimesheetsReport");
const http = require("codbex-perseus/gen/api/utils/http");

rs.service()
	.resource("")
		.get(function(ctx, request) {
			let queryOptions = {};
			let parameters = request.getParameterNames();
			for (let i = 0; i < parameters.length; i ++) {
				queryOptions[parameters[i]] = request.getParameter(parameters[i]);
			}
			let entities = dao.list(queryOptions);
			http.sendResponseOk(entities);
		})
		.catch(function(ctx, error) {
            if (error.name === "ForbiddenError") {
                http.sendForbiddenRequest(error.message));
            } else {
				http.sendResponseBadRequest(error.message);
			}
        })
.execute();
