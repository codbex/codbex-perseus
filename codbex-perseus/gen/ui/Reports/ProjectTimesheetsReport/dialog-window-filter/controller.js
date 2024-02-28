angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.Reports.ProjectTimesheetsReport';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-perseus/gen/api/Reports/ProjectTimesheetsReportService.ts";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', '$http', 'entityApi', function ($scope, messageHub, ViewParameters, $http, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		$scope.dataParameters = ViewParameters.get();
		if ($scope.dataParameters?.filter) {
			const filter = $scope.dataParameters.filter;
			if (filter.StartPeriod) {
				filter.StartPeriod = new Date(filter.StartPeriod);
			}
			if (filter.EndPeriod) {
				filter.EndPeriod = new Date(filter.EndPeriod);
			}
			$scope.ProjectValue = filter.Project;
			$scope.entity = filter;
			$scope.entity.Project = undefined;
		}

		$scope.filter = function () {
			const filter = {
				...$scope.entity
			};
			filter.StartPeriod = filter.StartPeriod?.getTime();
			filter.EndPeriod = filter.EndPeriod?.getTime();
			messageHub.postMessage("filter", filter);
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("ProjectTimesheetsReport-details-filter");
		};

		//----------------Dropdowns-----------------//
		$scope.optionsProject = [];

		$http.get("/services/ts/codbex-perseus/gen/api/Projects/ProjectService.ts").then(function (response) {
			$scope.optionsProject = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsProjectValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsProject.length; i++) {
				if ($scope.optionsProject[i].value === optionKey) {
					return $scope.optionsProject[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);