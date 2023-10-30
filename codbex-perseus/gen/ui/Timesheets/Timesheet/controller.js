angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.Timesheets.Timesheet';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-perseus/gen/api/Timesheets/Timesheet.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 20;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber) {
			$scope.dataPage = pageNumber;
			entityApi.count().then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Timesheet", `Unable to count Timesheet: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.list(offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("Timesheet", `Unable to list Timesheet: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
						if (e.StartPeriod) {
							e.StartPeriod = new Date(e.StartPeriod);
						}
						if (e.EndPeriod) {
							e.EndPeriod = new Date(e.EndPeriod);
						}
					});

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
			messageHub.showDialogWindow("Timesheet-details", {
				action: "select",
				entity: entity,
				optionsProjectAssignment: $scope.optionsProjectAssignment,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("Timesheet-details", {
				action: "create",
				entity: {},
				optionsProjectAssignment: $scope.optionsProjectAssignment,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("Timesheet-details", {
				action: "update",
				entity: entity,
				optionsProjectAssignment: $scope.optionsProjectAssignment,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete Timesheet?',
				`Are you sure you want to delete Timesheet? This action cannot be undone.`,
				[{
					id: "delete-btn-yes",
					type: "emphasized",
					label: "Yes",
				},
				{
					id: "delete-btn-no",
					type: "normal",
					label: "No",
				}],
			).then(function (msg) {
				if (msg.data === "delete-btn-yes") {
					entityApi.delete(id).then(function (response) {
						if (response.status != 204) {
							messageHub.showAlertError("Timesheet", `Unable to delete Timesheet: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsProjectAssignment = [];

		$http.get("/services/js/codbex-perseus/gen/api/Projects/ProjectAssignment.js").then(function (response) {
			$scope.optionsProjectAssignment = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsProjectAssignmentValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsProjectAssignment.length; i++) {
				if ($scope.optionsProjectAssignment[i].value === optionKey) {
					return $scope.optionsProjectAssignment[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
