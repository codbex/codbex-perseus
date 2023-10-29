angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.Projects.ProjectAssignment';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-perseus/gen/api/Projects/ProjectAssignment.js";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', function ($scope, $http, messageHub, entityApi) {

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
			$scope.loadPage($scope.dataPage);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber) {
			let Project = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			entityApi.count(Project).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("ProjectAssignment", `Unable to count ProjectAssignment: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let query = `Project=${Project}`;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.filter(query, offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("ProjectAssignment", `Unable to list ProjectAssignment: '${response.message}'`);
						return;
					}
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
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsEmployee = [];
		$scope.optionsProject = [];
		$scope.optionsPosition = [];

		$http.get("/services/js/codbex-perseus/gen/api/Employees/Employee.js").then(function (response) {
			$scope.optionsEmployee = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-perseus/gen/api/Projects/Project.js").then(function (response) {
			$scope.optionsProject = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-perseus/gen/api/Settings/Position.js").then(function (response) {
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
