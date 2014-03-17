'use strict';

angular.module('martaioApp').service('User', function User() {
  var data = JSON.parse(localStorage.getItem('martaio:user')) || {};
  var session = JSON.parse(sessionStorage.getItem('martaio:user')) || {};

  var user = {};
  // quick sessionStorage/localStorage interface generator thingy
  user.store = function(type) {
    return function(key, val, noPersist) {
      var store = type === 'local' ? localStorage : sessionStorage;
      var storeData = type === 'local' ? data : session;
      if (val === undefined) {
        return key ? storeData[key] : storeData;
      }
      storeData[key] = val;
      if (!noPersist) {
        store.setItem('martaio:user', JSON.stringify(storeData));
      }
      return key ? storeData[key] : storeData;
    };
  };
  user.data = user.store('local');
  user.session = user.store('session');

  return user;
});
