import createBrowserHistory from 'history/lib/createBrowserHistory';
import useQueries from 'history/lib/useQueries';
import useBasename from 'history/lib/useBasename';

export default useBasename(useQueries(createBrowserHistory))({ basename: '/webui' });
