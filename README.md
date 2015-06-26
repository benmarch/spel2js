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

```javascript
//list-controller.js

angular.module('ToDo').controller('ListController', ['$http', '$scope', 'SpelService', function ($http, $scope, SpelService) {
  
  $http.get('/api/permissions').success(function (permissions) {
    angular.forEach(permissions, function (spelExpression, key) {
      $scope.permissions[key] = SpelService.compile(spelExpression);
    });
  });
  
  $scope.list = {
    name: 'My List',
    owner: 'Ben March',
    items: [
      {
        text: 'List item number 1!'
      }
    ]
  }
  
  $scope.addListItem = function (list, newListItem) {
    if ($scope.permissions.ADD_LIST_ITEM_PERMISSION.eval(SpelService.getContext(), $scope)) {
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
    <button ng-click="addListItem(list, newListItem)" spel-if="permissions.ADD_LIST_ITEM_PERMISSION">Add</button>
  </li>
  ...
</div>
```

Seems like it might be a lot of work for such a simple piece of functionality; however, what happens when you add role-based
permissions as a new feature? If you already have this set up, it's as simple as adding " or hasRole('SuperUser')" to 
the SpEL, and exposing a minimal projection of the Authentication to the browser or Node app (which it probably already
has access to.) Now the UI can always stay in sync with the server-side authorities.

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

There are a few AngularJS directives (I just need to put them on GH):

- spelShow
- spelHide
- spelIf

If someone wants to implement a REST-compliant way in Spring to expose the permissions (and maybe the custom
PermissionEvaluators) that would be awesome.


## Install Choices
- `bower install spel2js`
- `npm install spel2js`
- [download the zip](https://github.com/benmarch/spel2js/archive/master.zip)

## Tasks

All tasks can be run by simply running `grunt` or with the `npm test` command, or individually:

  * `grunt lint` will lint source code for syntax errors and anti-patterns.
  * `grunt test` will run the jasmine unit tests against the source code.

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
