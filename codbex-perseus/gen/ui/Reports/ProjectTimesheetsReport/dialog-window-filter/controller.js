angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-perseus.Reports.ProjectTimesheetsReport';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/js/codbex-perseus/gen/api/Reports/ProjectTimesheetsReport.js";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', '$http', 'entityApi', function ($scope, messageHub, ViewParameters, $http, entityApi) {

		$scope.entity = {};
		$scope.formErrors = {};

		$scope.dataParameters = ViewParameters.get();
		if ($scope.dataParameters?.filter) {
			const filter = $scope.dataParameters.filter;
			$scope.ProjectValue = filter.Project;
			$scope.entity = filter;
			$scope.entity.Project = undefined;
		}

		$scope.isValid = function (isValid, property) {
			$scope.formErrors[property] = !isValid ? true : undefined;
			for (let next in $scope.formErrors) {
				if ($scope.formErrors[next] === true) {
					$scope.isFormValid = false;
					return;
				}
			}
			$scope.isFormValid = true;
		};

		$scope.filter = function () {
			const filter = {
				...$scope.entity
			};
			messageHub.postMessage("filter", filter);
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("ProjectTimesheetsReport-details-filter");
		};

		//----------------Dropdowns-----------------//
		$scope.optionsProject = [];

		$http.get("/services/js/codbex-perseus/gen/api/Projects/Project.js").then(function (response) {
			$scope.optionsProject = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
			$scope.entity.Project = $scope.ProjectValue;
		});
		$scope.optionsProjectValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsProject.length; i++) {
				if ($scope.optionsProject[i].value === optionKey) {
					return $scope.optionsProject[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);