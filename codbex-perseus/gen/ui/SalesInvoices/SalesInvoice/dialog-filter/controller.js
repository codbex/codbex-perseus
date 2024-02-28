angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.SalesInvoices.SalesInvoice';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-perseus/gen/api/SalesInvoices/SalesInvoiceService.ts";
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
				if (params?.entity?.DueFrom) {
					params.entity.DueFrom = new Date(params.entity.DueFrom);
				}
				if (params?.entity?.DueTo) {
					params.entity.DueTo = new Date(params.entity.DueTo);
				}
				$scope.entity = params.entity ?? {};
				$scope.selectedMainEntityKey = params.selectedMainEntityKey;
				$scope.selectedMainEntityId = params.selectedMainEntityId;
				$scope.optionsCustomer = params.optionsCustomer;
				$scope.optionsSalesOrder = params.optionsSalesOrder;
				$scope.optionsCurrency = params.optionsCurrency;
				$scope.optionsStatus = params.optionsStatus;
				$scope.optionsCompany = params.optionsCompany;
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
			if (entity.Number) {
				filter.$filter.contains.Number = entity.Number;
			}
			if (entity.DateFrom) {
				filter.$filter.greaterThanOrEqual.Date = entity.DateFrom;
			}
			if (entity.DateTo) {
				filter.$filter.lessThanOrEqual.Date = entity.DateTo;
			}
			if (entity.DueFrom) {
				filter.$filter.greaterThanOrEqual.Due = entity.DueFrom;
			}
			if (entity.DueTo) {
				filter.$filter.lessThanOrEqual.Due = entity.DueTo;
			}
			if (entity.Customer) {
				filter.$filter.equals.Customer = entity.Customer;
			}
			if (entity.SalesOrder) {
				filter.$filter.equals.SalesOrder = entity.SalesOrder;
			}
			if (entity.Amount) {
				filter.$filter.equals.Amount = entity.Amount;
			}
			if (entity.Currency) {
				filter.$filter.equals.Currency = entity.Currency;
			}
			if (entity.VAT) {
				filter.$filter.equals.VAT = entity.VAT;
			}
			if (entity.Discount) {
				filter.$filter.equals.Discount = entity.Discount;
			}
			if (entity.Taxes) {
				filter.$filter.equals.Taxes = entity.Taxes;
			}
			if (entity.Total) {
				filter.$filter.equals.Total = entity.Total;
			}
			if (entity.Conditions) {
				filter.$filter.contains.Conditions = entity.Conditions;
			}
			if (entity.PaymentMethod) {
				filter.$filter.contains.PaymentMethod = entity.PaymentMethod;
			}
			if (entity.SentMethod) {
				filter.$filter.contains.SentMethod = entity.SentMethod;
			}
			if (entity.Status) {
				filter.$filter.equals.Status = entity.Status;
			}
			if (entity.Company) {
				filter.$filter.equals.Company = entity.Company;
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
			messageHub.closeDialogWindow("SalesInvoice-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);