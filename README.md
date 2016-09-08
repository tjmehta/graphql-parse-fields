# graphql-parse-fields [![Build Status](https://travis-ci.org/tjmehta/graphql-parse-fields.svg)](https://travis-ci.org/tjmehta/graphql-parse-fields) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
Parse fields from AST (GraphQLResolveInfo) into a JSON tree

## Installation
```bash
npm i --save graphql-parse-fields
```

## Usage
Example1: Parse GraphQL resolve `info`
 * @param {Object} info - graphql resolve info
 * @param {Boolean} [ignoreRoot] - default: true
 * @return {Object} fieldTree
```js
var parseFields = require('graphql-parse-fields')

var GraphQLObjectType = //...
var UserType = //...

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    user: {
      type: UserType,
      resolve: function (root, args, ctx, info) {
        var fields = parseFields(info)
        /*
        Fields parsed from query (at bottom of this example):

        {
          id: true,
          name: true,
          widgets: {
            edges {
              node {
                id: true
              }
            }
          }
        }
        */

       var fieldsWithRoot = parseFields(info, true) // keepRoot: true
       /*
        Fields parsed from query (at bottom of this example):

        {
          user {
            id: true,
            name: true,
            widgets: {
              edges {
                node {
                  id: true
                }
              }
            }
          }
        }
        */
      },
    }
  }
})

/*
Query:

query userQuery {
  user {
    id
    name
    widgets {
      edges {
        node {
          id
        }
      }
    }
  }
}
*/
```

Example2: Parse GraphQL ASTs
 * @param {Array} asts - ast array
 * @param {Object} [fragments] - optional fragment map
 * @param {Object} [fieldTree] - optional initial field tree
 * @return {Object} fieldTree
```js
var ast = {
  "kind": "Field",
  "alias": null,
  "name": {
    "kind": "Name",
    "value": "user"
  },
  "selectionSet": {
    "kind": "SelectionSet",
    "selections": [
      {
        "kind": "Field",
        "name": {
          "kind": "Name",
          "value": "id"
        }
        selectionSet: null
        //...
      }
    ]
    //...
  }
  //...
}
parseAst(ast)
parseAst([ast])
/*
Both result in:
{
  user: {
    id: true
  }
}
*/
```

## License
MIT
