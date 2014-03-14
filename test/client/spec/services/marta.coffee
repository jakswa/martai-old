'use strict'

describe 'Service: Marta', () ->

  # load the service's module
  beforeEach module 'martaioApp'

  # instantiate service
  Marta = {}
  beforeEach inject (_Marta_) ->
    Marta = _Marta_

  it 'should do something', () ->
    expect(!!Marta).toBe true
