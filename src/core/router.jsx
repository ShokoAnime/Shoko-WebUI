import 'isomorphic-fetch';
import React from 'react';
import { forEach } from 'lodash';

function decodeParam(val) {
  if (!(typeof val === 'string' || val.length === 0)) {
    return val;
  }

  try {
    return decodeURIComponent(val);
  } catch (err) {
    if (err instanceof URIError) {
      err.message = `Failed to decode param '${val}'`;
      err.status = 400;
    }

    throw err;
  }
}

// Match the provided URL path pattern to an actual URI string. For example:
//   matchURI({ path: '/posts/:id' }, '/dummy') => null
//   matchURI({ path: '/posts/:id' }, '/posts/123') => { id: 123 }
function matchURI(route, path) {
  const match = route.pattern.exec(path);

  if (!match) {
    return null;
  }

  const params = Object.create(null);

  for (let i = 1; i < match.length; i += 1) {
    params[route.keys[i - 1].name] = match[i] !== undefined ? decodeParam(match[i]) : undefined;
  }

  return params;
}

// Find the route matching the specified location (context), fetch the required data,
// instantiate and return a React component
function resolve(routes, context) {
  let resolvedRoute = null;
  forEach(routes, (route) => {
    const params = matchURI(route, context.error ? '/error' : context.pathname);

    if (!params) {
      return true;
    }

    // Check if the route has any data requirements, for example:
    // { path: '/tasks/:id', data: { task: 'GET /api/tasks/$id' }, page: './pages/task' }
    if (route.data) {
      // Load page component and all required data in parallel
      const keys = Object.keys(route.data);
      resolvedRoute = Promise.all([
        route.load(),
        ...keys.map((key) => { // eslint-disable-line no-loop-func
          const query = route.data[key];
          const method = query.substring(0, query.indexOf(' ')); // GET
          const url = query.substr(query.indexOf(' ') + 1);      // /api/tasks/$id
          // TODO: Replace query parameters with actual values coming from `params`
          // eslint-disable-next-line no-undef
          return fetch(url, { method }).then(resp => resp.json());
        }),
      ]).then(([Page, ...data]) => {
        const props = keys.reduce((result, key, i) => ({ ...result, [key]: data[i] }), {});
        return <Page route={route} error={context.error} {...props} />;
      });
      return false;
    }

    resolvedRoute = route.load().then(Page => <Page route={route} error={context.error} />);
    return false;
  });

  if (resolvedRoute !== null) return resolvedRoute;

  const error = new Error('Page not found');
  error.status = 404;
  return Promise.reject(error);
}

export default { resolve };
