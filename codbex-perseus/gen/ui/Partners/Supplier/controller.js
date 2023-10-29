angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.Partners.Supplier';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-perseus/gen/api/Partners/Supplier.js";
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
					messageHub.showAlertError("Supplier", `Unable to count Supplier: '${response.message}'`);
					return;
				}
				$scope.dataCount = response.data;
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				entityApi.list(offset, limit).then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("Supplier", `Unable to list Supplier: '${response.message}'`);
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
			messageHub.showDialogWindow("Supplier-details", {
				action: "select",
				entity: entity,
				optionsCity: $scope.optionsCity,
				optionsCountryId: $scope.optionsCountryId,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("Supplier-details", {
				action: "create",
				entity: {},
				optionsCity: $scope.optionsCity,
				optionsCountryId: $scope.optionsCountryId,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("Supplier-details", {
				action: "update",
				entity: entity,
				optionsCity: $scope.optionsCity,
				optionsCountryId: $scope.optionsCountryId,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete Supplier?',
				`Are you sure you want to delete Supplier? This action cannot be undone.`,
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
							messageHub.showAlertError("Supplier", `Unable to delete Supplier: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsCity = [];
		$scope.optionsCountryId = [];

		$http.get("/services/js/codbex-perseus/gen/api/Settings/City.js").then(function (response) {
			$scope.optionsCity = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$http.get("/services/js/codbex-perseus/gen/api/Settings/Country.js").then(function (response) {
			$scope.optionsCountryId = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});
		$scope.optionsCityValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsCity.length; i++) {
				if ($scope.optionsCity[i].value === optionKey) {
					return $scope.optionsCity[i].text;
				}
			}
			return null;
		};
		$scope.optionsCountryIdValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsCountryId.length; i++) {
				if ($scope.optionsCountryId[i].value === optionKey) {
					return $scope.optionsCountryId[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
