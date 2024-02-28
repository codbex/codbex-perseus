angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.Payslips.Payslip';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-perseus/gen/api/Payslips/PayslipService.ts";
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
				$scope.optionsCompany = params.optionsCompany;
				$scope.optionsCurrency = params.optionsCurrency;
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
			if (entity.Company) {
				filter.$filter.equals.Company = entity.Company;
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
			if (entity.Currency) {
				filter.$filter.equals.Currency = entity.Currency;
			}
			if (entity.Net) {
				filter.$filter.equals.Net = entity.Net;
			}
			if (entity.Gross) {
				filter.$filter.equals.Gross = entity.Gross;
			}
			if (entity.Total) {
				filter.$filter.equals.Total = entity.Total;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			messageHub.postMessage("clearDetails");
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("Payslip-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);