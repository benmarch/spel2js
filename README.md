# spel2js
[![Build Status][build-image]][build-url]
[![Test Coverage][coverage-image]][coverage-url]
[![Dependency Status][depstat-image]][depstat-url]
[![Bower Version][bower-image]][bower-url]
[![NPM version][npm-image]][npm-url]
<!--[![Code GPA][gpa-image]][gpa-url]
[![IRC Channel][irc-image]][irc-url]
[![Gitter][gitter-image]][gitter-url]
[![GitTip][tip-image]][tip-url]-->

## About

SpEL2JS is a plugin that will parse [Spring Expression Language](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/expressions.html) 
within a defined context in JavaScript. This is useful in single-page applications where duplication of authorization 
expressions for UI purposes can lead to inconsistencies. This library implements a JavaScript version of the parser based
on the documentation in the link above. I did my best to followed the docs as closely as possible, but if you come accross
an expression that behaves differently than you would expect then please open an issue.


## Getting Started

Install SpEL2JS:
```sh
$ npm i -S spel2js 
# or
$ bower i -S spel2js
```

Or [download the zip](https://github.com/benmarch/spel2js/archive/master.zip)

Include the dependency using a module loader or script tag.

## Usage

SpEL2JS exports a singleton with two members:
```js
import spel2js from 'spel2js';

console.log(spel2js);
/*
{
  StandardContext,
  SpelExpressionEvaluator
}
*/
```

### `StandardContext`

The `StandardContext` is a factory that creates a evaluation context for an expression.
**NOTE:** This is not the same as the Java `EvaluationContext` class, though it serves a similar purpose.

```js
let spelContext = spel2js.StandardContext.create(authentication, principal);
```

The `create()` method takes two arguments: `authentication` and `principal`

`authentication` is an instance of Spring's [`Authentication`](https://docs.spring.io/spring-security/site/docs/current/apidocs/org/springframework/security/core/Authentication.html) class from Spring Security.

`principal` is any object representing the user (this is just used for reference, and can be any value or structure)

### `SpelExpressionEvaluator`

The heavy lifting is done using the `SpelExpressionEvaluator` which exposes two functions: `compile()` and `eval()`

`compile()` pre-compiles a SpEL expression, and returns an object with an `eval()` method that takes a context and optional locals:

```js
import { StandardContext, SpelExpressionEvaluator } from 'spel2js';

const expression = '#toDoList.owner == authentication.details.name';
const spelContext = StandardContext.create(authentication, principal);
const locals = {
  toDoList: {
    owner: 'Darth Vader'  
  }
};

const compiledExpression = SpelExpressionEvaluator.compile(expression);

compiledExpression.eval(spelContext, locals); // true
```

`eval()` is just a shortcut for immediately evaluating an expression instead of pre-compiling:

```js
import { StandardContext, SpelExpressionEvaluator } from 'spel2js';

const expression = '#toDoList.owner == authentication.details.name';
const spelContext = StandardContext.create(authentication, principal);
const locals = {
  toDoList: {
    owner: 'Darth Vader'  
  }
};

SpelExpressionEvaluator.eval(expression, spelContext, locals); // true
```

### Recommended Usage

Create a single context that contains information about the current user and reuse it for all evaluations.
This way, you only have to supply an expression and locals when evaluating.

Always pre-compile your expressions! Compilation takes much longer than evaluation; doing it up-front saves CPU when evaluating later.

## Example

Say you are creating a shared to-do list, and you want to allow only the owner of the list to make changes, but anyone can view: 

```java
//ListController.java

@Controller
@RequestMapping('/todolists')
public class ListController {

  public static final String ADD_LIST_ITEM_PERMISSION = "#toDoList.owner == authentication.details.name";  
  ...
  
  @PreAuthorize(ADD_LIST_ITEM_PERMISSION)
  @RequestMapping(value="/{toDolistId}/items", method=RequestMethod.POST)
  public ResponseEntity<ListItem> addListItem(@MagicAnnotation ToDoList toDoList, @RequestBody ListItem newListItem) {
    //add the item to the list
    return new ResponseEntity<ListItem>(newListItem, HttpStatus.CREATED);
  }

  ...
}
```

```js
//spel-service.js

import { StandardContext, SpelExpressionEvaluator } from 'spel2js';

// wraps spel2js in a stateful service that simplifies evaluation
angular.module('ToDo').factory('SpelService', function () {
    
  return {
    context: null,
    
    // assume this is called on page load
    setContext(authentication, principal) {
      this.context = StandardContext.create(authentication, principal);
    },
    
    getContext() { return this.context; },
    
    compile(expression) {
      const compiledExpression = SpelExpressionEvaluator.compile(expression); 
      return {
        eval(locals) { 
          return compiledExpression.eval(this.getContext(), locals);
        }
      };
    },
    
    eval(expression, locals) {
      return SpelExpressionEvaluator.eval(expression, this.getContext(), locals);
    }
  };
  
});


//list-controller.js

angular.module('ToDo').controller('ListController', ['$http', '$scope', 'SpelService', function ($http, $scope, SpelService) {
  
  // retrieve all permissions and pre-compile them
  $http.get('/api/permissions').success(function (permissions) {
    angular.forEach(permissions, function (spelExpression, key) {
      $scope.permissions[key] = SpelService.compile(spelExpression);
    });
  });
  
  // $scope will be used as locals
  $scope.list = {
    name: 'My List',
    owner: 'Ben March',
    items: [
      {
        text: 'List item number 1!'
      }
    ]
  }
  
  // EXPAMPLE 1: authorize a request before making it
  $scope.addListItem = function (list, newListItem) {
    if ($scope.permissions.ADD_LIST_ITEM_PERMISSION.eval($scope)) {
      $http.post('/todolists/' + list.id + '/items', item).success(function () {...});  
    }
  }
}]);
```

```html
<!--list-controller.html-->

<div ng-controller="ListController">
  ...
  <li ng-repeat="listItem in list.items">
    <p>{{listItem.text}}</p>
  </li>
  <li class="list-actions">
    <input type="text" ng-model="newListItem.text" />
    
    <!-- EXAMPLE 2: Hide the button if the user does not have permission -->
    <button ng-click="addListItem(list, newListItem)" ng-if="permissions.ADD_LIST_ITEM_PERMISSION.eval(this)">Add</button>
  </li>
  ...
</div>
```

Now the UI can always stay in sync with the server-side authorities.

## Features

This is now in a stable state and will be released as 0.2.0. The following features are tested and working:

- Primitive Literals
- Property references
- Compound expressions
- Comparisons
- Method references
- Local variable reference ("#someVar")
- Math
- Ternary operators
- Safe navigation
- Assignment
- Complex literals
- Projection/selection
- Increment/Decrement
- Logical operators (and, or, not)
- hasRole() (if you use spel2js.StandardContext)

The following are not implemented yet because I'm not sure of the best approach:

- Qualified identifiers/Type references/Bean References
- hasPermission() for custom permission evaluators

If someone wants to implement a REST-compliant way in Spring to expose the permissions (and maybe the custom
PermissionEvaluators) that would be awesome.

## Building Locally

```sh
$ npm i
$ npm run build
$ npm test
```

## Credits

Credit is given to all of the original authors of the Java SpEL implementation at the time of this library's creation:

- Andy Clement
- Juergen Hoeller
- Giovanni Dall'Oglio Risso
- Sam Brannen
- Mark Fisher
- Oliver Becker
- Clark Duplichien
- Phillip Webb
- Stephane Nicoll
- Ivo Smid

This repository was scaffolded with [generator-microjs](https://github.com/daniellmb/generator-microjs).

## License

Since this was ported from the Spring Framework, this library is under version 2.0 of the [Apache License](http://www.apache.org/licenses/LICENSE-2.0).

[build-url]: https://travis-ci.org/benmarch/spel2js
[build-image]: http://img.shields.io/travis/benmarch/spel2js.png

[gpa-url]: https://codeclimate.com/github/benmarch/spel2js
[gpa-image]: https://codeclimate.com/github/benmarch/spel2js.png

[coverage-url]: https://codeclimate.com/github/benmarch/spel2js/code?sort=covered_percent&sort_direction=desc
[coverage-image]: https://codeclimate.com/github/benmarch/spel2js/coverage.png

[depstat-url]: https://david-dm.org/benmarch/spel2js
[depstat-image]: https://david-dm.org/benmarch/spel2js.png?theme=shields.io

[issues-url]: https://github.com/benmarch/spel2js/issues
[issues-image]: http://img.shields.io/github/issues/benmarch/spel2js.png

[bower-url]: http://bower.io/search/?q=spel2js
[bower-image]: https://badge.fury.io/bo/spel2js.png

[downloads-url]: https://www.npmjs.org/package/spel2js
[downloads-image]: http://img.shields.io/npm/dm/spel2js.png

[npm-url]: https://www.npmjs.org/package/spel2js
[npm-image]: https://badge.fury.io/js/spel2js.png

[irc-url]: http://webchat.freenode.net/?channels=spel2js
[irc-image]: http://img.shields.io/badge/irc-%23spel2js-brightgreen.png

[gitter-url]: https://gitter.im/benmarch/spel2js
[gitter-image]: http://img.shields.io/badge/gitter-benmarch/spel2js-brightgreen.png

[tip-url]: https://www.gittip.com/benmarch
[tip-image]: http://img.shields.io/gittip/benmarch.png
