'use strict'

var expect = require('chai').expect
var graphql = require('graphql')
var multiline = require('multiline')
var parseFields = require('../')

var describe = global.describe
var beforeEach = global.beforeEach
var it = global.it

var schema = require('./fixtures/schema.js')
var nestedFragmentsQuery = multiline(function () { /*
query userQuery {
  user {
    ...A
    ... on User {
      id
    }
  }
}
fragment A on User {
  widgets {
    edges {
      node {
        id
      }
    }
  }
  ...B
}
fragment B on User {
  name
  widgets {
    edges {
      node {
        name
      }
    }
  }
}
*/ })

describe('graphql-parse-fields', function () {
  beforeEach(function () {
    var self = this
    schema.getQueryType().getFields().user.resolve = resolve
    function resolve (a, b, c, info) {
      // set info on context so it can be accessed in the test
      self.info = info
      return null
    }
    expect(schema.getQueryType().getFields().user.resolve).to.equal(resolve)
  })

  it('should parse info fields ast w/ nested fragments', function () {
    var self = this
    return graphql.graphql(schema, nestedFragmentsQuery, null, {}).then(function (data) {
      if (data.errors) {
        data.errors.forEach(function (err) {
          console.error('Error:', err.stack)
        })
        throw new Error('graphql error')
      }
      expect(self.info).to.exist
      expect(parseFields(self.info)).to.deep.equal({
        id: true,
        name: true,
        widgets: {
          edges: {
            node: {
              id: true,
              name: true
            }
          }
        }
      })
    })
  })

  describe('keepRoot: true', function () {
    it('should parse info fields ast w/ nested fragments', function () {
      var self = this
      return graphql.graphql(schema, nestedFragmentsQuery, null, {}).then(function (data) {
        if (data.errors) {
          data.errors.forEach(function (err) {
            console.error('Error:', err.stack)
          })
          throw new Error('graphql error')
        }
        expect(self.info).to.exist
        expect(parseFields(self.info, true)).to.deep.equal({
          user: {
            id: true,
            name: true,
            widgets: {
              edges: {
                node: {
                  id: true,
                  name: true
                }
              }
            }
          }
        })
      })
    })
  })

  it('should parse AST fields', function () {
    var self = this
    return graphql.graphql(schema, nestedFragmentsQuery, null, {}).then(function (data) {
      if (data.errors) {
        data.errors.forEach(function (err) {
          console.error('Error:', err.stack)
        })
        throw new Error('graphql error')
      }
      expect(self.info).to.exist
      expect(parseFields(self.info.fieldNodes, self.info.fragments, { yolo: true })).to.deep.equal({
        yolo: true,
        user: {
          id: true,
          name: true,
          widgets: {
            edges: {
              node: {
                id: true,
                name: true
              }
            }
          }
        }
      })
    })
  })

  it('should not error if it sees an invalid "kind"', function () {
    var asts = {
      'kind': 'Field',
      'alias': null,
      'name': {
        'kind': 'Name',
        'value': 'user'
      },
      'selectionSet': {
        'kind': 'SelectionSet',
        'selections': [
          {
            'kind': 'BOGUS_KIND'
          }
        ]
      }
    }
    expect(parseFields(asts)).to.deep.equal({
      user: {}
    })
  })
})
