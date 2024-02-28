angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.Payments.PaymentEntry';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-perseus/gen/api/Payments/PaymentEntryService.ts";
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
				if (params?.entity?.DateFrom) {
					params.entity.DateFrom = new Date(params.entity.DateFrom);
				}
				if (params?.entity?.DateTo) {
					params.entity.DateTo = new Date(params.entity.DateTo);
				}
				if (params?.entity?.ValorFrom) {
					params.entity.ValorFrom = new Date(params.entity.ValorFrom);
				}
				if (params?.entity?.ValorTo) {
					params.entity.ValorTo = new Date(params.entity.ValorTo);
				}
				$scope.entity = params.entity ?? {};
				$scope.selectedMainEntityKey = params.selectedMainEntityKey;
				$scope.selectedMainEntityId = params.selectedMainEntityId;
				$scope.optionsCompany = params.optionsCompany;
				$scope.optionsCurrency = params.optionsCurrency;
				$scope.optionsDirection = params.optionsDirection;
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
			if (entity.DateFrom) {
				filter.$filter.greaterThanOrEqual.Date = entity.DateFrom;
			}
			if (entity.DateTo) {
				filter.$filter.lessThanOrEqual.Date = entity.DateTo;
			}
			if (entity.ValorFrom) {
				filter.$filter.greaterThanOrEqual.Valor = entity.ValorFrom;
			}
			if (entity.ValorTo) {
				filter.$filter.lessThanOrEqual.Valor = entity.ValorTo;
			}
			if (entity.Company) {
				filter.$filter.equals.Company = entity.Company;
			}
			if (entity.CompanyIBAN) {
				filter.$filter.contains.CompanyIBAN = entity.CompanyIBAN;
			}
			if (entity.CounterpartyIBAN) {
				filter.$filter.contains.CounterpartyIBAN = entity.CounterpartyIBAN;
			}
			if (entity.CounterpartyName) {
				filter.$filter.contains.CounterpartyName = entity.CounterpartyName;
			}
			if (entity.Amount) {
				filter.$filter.equals.Amount = entity.Amount;
			}
			if (entity.Currency) {
				filter.$filter.equals.Currency = entity.Currency;
			}
			if (entity.Reason) {
				filter.$filter.contains.Reason = entity.Reason;
			}
			if (entity.Description) {
				filter.$filter.contains.Description = entity.Description;
			}
			if (entity.Direction) {
				filter.$filter.equals.Direction = entity.Direction;
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
			messageHub.closeDialogWindow("PaymentEntry-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);