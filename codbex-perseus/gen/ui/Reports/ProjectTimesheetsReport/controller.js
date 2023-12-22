angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.Reports.ProjectTimesheetsReport';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-perseus/gen/api/Reports/ProjectTimesheetsReportService.ts";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'entityApi', function ($scope, messageHub, entityApi) {

		$scope.filter = {};

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 20;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("filter", function (msg) {
			$scope.filter = msg.data;
			$scope.loadPage(1);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber) {
			const listFilter = {
				$offset: (pageNumber - 1) * $scope.dataLimit,
				$limit: $scope.dataLimit,
				...$scope.filter
			};
			$scope.dataPage = pageNumber;
			entityApi.count($scope.filter).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("ProjectTimesheetsReport", `Unable to count ProjectTimesheetsReport: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				entityApi.list(listFilter).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("ProjectTimesheetsReport", `Unable to list ProjectTimesheetsReport: '${response.message}'`);
						return;
					}
					$scope.data = response.data;
				});
			});
		};
		$scope.loadPage($scope.dataPage);

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("ProjectTimesheetsReport-details", {
				action: "select",
				entity: entity,
			});
		};

		$scope.openFilter = function () {
			messageHub.showDialogWindow("ProjectTimesheetsReport-details-filter", {
				action: "filter",
				filter: $scope.filter
			});
		};


	}]);
