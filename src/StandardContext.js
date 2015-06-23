(function (exports) {
    'use strict';

    function create(authentication, principal) {
        var context = {};

        context.authentication = authentication || {};
        context.principal = principal || {};

        context.hasRole = function (role) {
            if (!context.authentication && !context.authentication.authorities) {
                return false;
            }

            return !!~context.authentication.authorities.indexOf(role);
        };

        context.hasPermission = function (/*variable arguments*/) {
            var args = Array.prototype.slice.call(arguments);

            if (args.length === 1) {
                return context.hasRole(args[0]);
            }
        }
    }

    exports.StandardContext = {
        create: create
    };

}(window || exports));
