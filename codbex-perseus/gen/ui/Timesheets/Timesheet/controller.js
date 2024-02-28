angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.Timesheets.Timesheet';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-perseus/gen/api/Timesheets/TimesheetService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		//-----------------Custom Actions-------------------//
		$http.get("/services/js/resources-core/services/custom-actions.js?extensionPoint=codbex-perseus-custom-action").then(function (response) {
			$scope.pageActions = response.data.filter(e => e.perspective === "Timesheets" && e.view === "Timesheet" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === "Timesheets" && e.view === "Timesheet" && e.type === "entity");
		});

		$scope.triggerPageAction = function (actionId) {
			for (const next of $scope.pageActions) {
				if (next.id === actionId) {
					messageHub.showDialogWindow("codbex-perseus-custom-action", {
						src: next.link,
					});
					break;
				}
			}
		};

		$scope.triggerEntityAction = function (actionId, selectedEntity) {
			for (const next of $scope.entityActions) {
				if (next.id === actionId) {
					messageHub.showDialogWindow("codbex-perseus-custom-action", {
						src: `${next.link}?id=${selectedEntity.Id}`,
					});
					break;
				}
			}
		};
		//-----------------Custom Actions-------------------//

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 20;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entitySearch", function (msg) {
			resetPagination();
			$scope.filter = msg.data.filter;
			$scope.filterEntity = msg.data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber, filter) {
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			$scope.dataPage = pageNumber;
			entityApi.count(filter).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Timesheet", `Unable to count Timesheet: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				let request;
				if (filter) {
					filter.$offset = offset;
					filter.$limit = limit;
					request = entityApi.search(filter);
				} else {
					request = entityApi.list(offset, limit);
				}
				request.then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("Timesheet", `Unable to list/filter Timesheet: '${response.message}'`);
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
		$scope.loadPage($scope.dataPage, $scope.filter);

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

		$scope.openFilter = function (entity) {
			messageHub.showDialogWindow("Timesheet-filter", {
				entity: $scope.filterEntity,
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
						$scope.loadPage($scope.dataPage, $scope.filter);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsProjectAssignment = [];


		$http.get("/services/ts/codbex-perseus/gen/api/Projects/ProjectAssignmentService.ts").then(function (response) {
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
