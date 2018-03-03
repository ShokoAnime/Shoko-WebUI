// @flow
import Version from '../../public/version.json';

export function uiVersion() {
  return Version.debug ? Version.git : Version.package; // eslint-disable-line no-undef
}

export default { };
