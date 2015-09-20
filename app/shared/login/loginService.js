
module.exports = function($rootScope){	

	this.setAuth = function(){
		$rootScope.userIsAuthenticated = true;
	}


	this.isAuth = function(){
		return $rootScope.userIsAuthenticated;
	}

	this.disconnect = function(){
		$rootScope.userIsAuthenticated = false;		
	}

	return this;

};