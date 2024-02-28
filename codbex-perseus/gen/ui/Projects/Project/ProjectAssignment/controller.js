angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.Projects.ProjectAssignment';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-perseus/gen/api/Projects/ProjectAssignmentService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

		//-----------------Custom Actions-------------------//
		$http.get("/services/js/resources-core/services/custom-actions.js?extensionPoint=codbex-perseus-custom-action").then(function (response) {
			$scope.pageActions = response.data.filter(e => e.perspective === "Projects" && e.view === "ProjectAssignment" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === "Projects" && e.view === "ProjectAssignment" && e.type === "entity");
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
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("codbex-perseus.Projects.Project.entitySelected", function (msg) {
			resetPagination();
			$scope.selectedMainEntityId = msg.data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}, true);

		messageHub.onDidReceiveMessage("codbex-perseus.Projects.Project.clearDetails", function (msg) {
			$scope.$apply(function () {
				resetPagination();
				$scope.selectedMainEntityId = null;
				$scope.data = null;
			});
		}, true);

		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.action = 'select';
			});
		});

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
			let Project = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			if (!filter) {
				filter = {};
			}
			if (!filter.$filter) {
				filter.$filter = {};
			}
			if (!filter.$filter.equals) {
				filter.$filter.equals = {};
			}
			filter.$filter.equals.Project = Project;
			entityApi.count(filter).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("ProjectAssignment", `Unable to count ProjectAssignment: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				filter.$offset = (pageNumber - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				entityApi.search(filter).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("ProjectAssignment", `Unable to list/filter ProjectAssignment: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
						if (e.StartDate) {
							e.StartDate = new Date(e.StartDate);
						}
						if (e.EndDate) {
							e.EndDate = new Date(e.EndDate);
						}
					});

					$scope.data = response.data;
				});
			});
		};

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("ProjectAssignment-details", {
				action: "select",
				entity: entity,
				optionsEmployee: $scope.optionsEmployee,
				optionsProject: $scope.optionsProject,
				optionsPosition: $scope.optionsPosition,
			});
		};

		$scope.openFilter = function (entity) {
			messageHub.showDialogWindow("ProjectAssignment-filter", {
				entity: $scope.filterEntity,
				optionsEmployee: $scope.optionsEmployee,
				optionsProject: $scope.optionsProject,
				optionsPosition: $scope.optionsPosition,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("ProjectAssignment-details", {
				action: "create",
				entity: {},
				selectedMainEntityKey: "Project",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsEmployee: $scope.optionsEmployee,
				optionsProject: $scope.optionsProject,
				optionsPosition: $scope.optionsPosition,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("ProjectAssignment-details", {
				action: "update",
				entity: entity,
				selectedMainEntityKey: "Project",
				selectedMainEntityId: $scope.selectedMainEntityId,
				optionsEmployee: $scope.optionsEmployee,
				optionsProject: $scope.optionsProject,
				optionsPosition: $scope.optionsPosition,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete ProjectAssignment?',
				`Are you sure you want to delete ProjectAssignment? This action cannot be undone.`,
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
							messageHub.showAlertError("ProjectAssignment", `Unable to delete ProjectAssignment: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage, $scope.filter);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsEmployee = [];
		$scope.optionsProject = [];
		$scope.optionsPosition = [];


		$http.get("/services/ts/codbex-perseus/gen/api/Employees/EmployeeService.ts").then(function (response) {
			$scope.optionsEmployee = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-perseus/gen/api/Projects/ProjectService.ts").then(function (response) {
			$scope.optionsProject = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/ts/codbex-perseus/gen/api/Settings/PositionService.ts").then(function (response) {
			$scope.optionsPosition = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$scope.optionsEmployeeValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsEmployee.length; i++) {
				if ($scope.optionsEmployee[i].value === optionKey) {
					return $scope.optionsEmployee[i].text;
				}
			}
			return null;
		};
		$scope.optionsProjectValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsProject.length; i++) {
				if ($scope.optionsProject[i].value === optionKey) {
					return $scope.optionsProject[i].text;
				}
			}
			return null;
		};
		$scope.optionsPositionValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsPosition.length; i++) {
				if ($scope.optionsPosition[i].value === optionKey) {
					return $scope.optionsPosition[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
