/**
 * ajax script converted to a plugin
 * https://github.com/fdaciuk/ajax
 * Removed the chained sub-methods (get, post, ...)
 *
 * @param options Array of options
 */

$.ajax = function (options) {
    /**
     * handle options and default values
     */
    options = options || {};
    options.baseUrl = options.baseUrl || '';
    options.method = options.method || 'get';
    options.data = options.data || null;

    //var methods = ['get', 'post', 'put', 'delete'];

//    if (options.method && options.url) {
      return xhrConnection(
        options.method,
        options.baseUrl + options.url,
        options.data,
        options
      )
/*    }

    return methods.reduce(function (acc, method) {
      acc[method] = function (url, data) {
        return xhrConnection(
          method,
          options.baseUrl + url,
          data,
          options
        )
      }
      return acc
    }, {})
*/


    function xhrConnection (type, url, data, options) {
      var returnMethods = ['then', 'catch', 'always']
      var promiseMethods = returnMethods.reduce(function (promise, method) {
        promise[method] = function (callback) {
          promise[method] = callback
          return promise
        }
        return promise
      }, {})
      var xhr = new XMLHttpRequest()
      xhr.open(type, url, true)
      xhr.withCredentials = options.hasOwnProperty('withCredentials')
      setHeaders(xhr, options.headers)
      xhr.addEventListener('readystatechange', ready(promiseMethods, xhr), false)
      xhr.send(objectToQueryString(data))
      promiseMethods.abort = function () {
        return xhr.abort()
      }
      return promiseMethods
    }

    function setHeaders (xhr, headers) {
      headers = headers || {}
      if (!hasContentType(headers)) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
      }
      Object.keys(headers).forEach(function (name) {
        (headers[name] && xhr.setRequestHeader(name, headers[name]))
      })
    }

    function hasContentType (headers) {
      return Object.keys(headers).some(function (name) {
        return name.toLowerCase() === 'content-type'
      })
    }

    function ready (promiseMethods, xhr) {
      return function handleReady () {
        if (xhr.readyState === xhr.DONE) {
          xhr.removeEventListener('readystatechange', handleReady, false)
          promiseMethods.always.apply(promiseMethods, parseResponse(xhr))

          if (xhr.status >= 200 && xhr.status < 300) {
            promiseMethods.then.apply(promiseMethods, parseResponse(xhr))
          } else {
            promiseMethods.catch.apply(promiseMethods, parseResponse(xhr))
          }
        }
      }
    }

    function parseResponse (xhr) {
      var result
      try {
        result = JSON.parse(xhr.responseText)
      } catch (e) {
        result = xhr.responseText
      }
      return [ result, xhr ]
    }

    function objectToQueryString (data) {
      return isObject(data) ? getQueryString(data) : data
    }

    function isObject (data) {
      return Object.prototype.toString.call(data) === '[object Object]'
    }

    function getQueryString (object) {
      return Object.keys(object).reduce(function (acc, item) {
        var prefix = !acc ? '' : acc + '&'
        return prefix + encode(item) + '=' + encode(object[item])
      }, '')
    }

    function encode (value) {
      return encodeURIComponent(value)
    }
  }
