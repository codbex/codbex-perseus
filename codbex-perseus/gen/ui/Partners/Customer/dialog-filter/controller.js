angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.Partners.Customer';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-perseus/gen/api/Partners/CustomerService.ts";
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
				$scope.entity = params.entity ?? {};
				$scope.selectedMainEntityKey = params.selectedMainEntityKey;
				$scope.selectedMainEntityId = params.selectedMainEntityId;
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
			if (entity.Contact) {
				filter.$filter.contains.Contact = entity.Contact;
			}
			if (entity.Email) {
				filter.$filter.contains.Email = entity.Email;
			}
			if (entity.Phone) {
				filter.$filter.contains.Phone = entity.Phone;
			}
			if (entity.Address) {
				filter.$filter.contains.Address = entity.Address;
			}
			if (entity.PostCode) {
				filter.$filter.contains.PostCode = entity.PostCode;
			}
			if (entity.City) {
				filter.$filter.contains.City = entity.City;
			}
			if (entity.Country) {
				filter.$filter.contains.Country = entity.Country;
			}
			if (entity.IBAN) {
				filter.$filter.contains.IBAN = entity.IBAN;
			}
			if (entity.VATNO) {
				filter.$filter.contains.VATNO = entity.VATNO;
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
			messageHub.closeDialogWindow("Customer-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);