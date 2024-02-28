angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.Projects.ProjectAssignment';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-perseus/gen/api/Projects/ProjectAssignmentService.ts";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'entityApi', function ($scope, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		if (window != null && window.frameElement != null && window.frameElement.hasAttribute("data-parameters")) {
			let dataParameters = window.frameElement.getAttribute("data-parameters");
			if (dataParameters) {
				let params = JSON.parse(dataParameters);
				if (params?.entity?.StartDateFrom) {
					params.entity.StartDateFrom = new Date(params.entity.StartDateFrom);
				}
				if (params?.entity?.StartDateTo) {
					params.entity.StartDateTo = new Date(params.entity.StartDateTo);
				}
				if (params?.entity?.EndDateFrom) {
					params.entity.EndDateFrom = new Date(params.entity.EndDateFrom);
				}
				if (params?.entity?.EndDateTo) {
					params.entity.EndDateTo = new Date(params.entity.EndDateTo);
				}
				$scope.entity = params.entity ?? {};
				$scope.selectedMainEntityKey = params.selectedMainEntityKey;
				$scope.selectedMainEntityId = params.selectedMainEntityId;
				$scope.optionsEmployee = params.optionsEmployee;
				$scope.optionsProject = params.optionsProject;
				$scope.optionsPosition = params.optionsPosition;
			}
		}

		$scope.filter = function () {
			let entity = $scope.entity;
			const filter = {
				$filter: {
					equals: {
					},
					notEquals: {
					},
					contains: {
					},
					greaterThan: {
					},
					greaterThanOrEqual: {
					},
					lessThan: {
					},
					lessThanOrEqual: {
					}
				},
			};
			if (entity.Id) {
				filter.$filter.equals.Id = entity.Id;
			}
			if (entity.Name) {
				filter.$filter.contains.Name = entity.Name;
			}
			if (entity.Employee) {
				filter.$filter.equals.Employee = entity.Employee;
			}
			if (entity.Project) {
				filter.$filter.equals.Project = entity.Project;
			}
			if (entity.Position) {
				filter.$filter.equals.Position = entity.Position;
			}
			if (entity.HourlyRate) {
				filter.$filter.equals.HourlyRate = entity.HourlyRate;
			}
			if (entity.StartDateFrom) {
				filter.$filter.greaterThanOrEqual.StartDate = entity.StartDateFrom;
			}
			if (entity.StartDateTo) {
				filter.$filter.lessThanOrEqual.StartDate = entity.StartDateTo;
			}
			if (entity.EndDateFrom) {
				filter.$filter.greaterThanOrEqual.EndDate = entity.EndDateFrom;
			}
			if (entity.EndDateTo) {
				filter.$filter.lessThanOrEqual.EndDate = entity.EndDateTo;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("ProjectAssignment-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);