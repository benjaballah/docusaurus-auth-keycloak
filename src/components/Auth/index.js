import React, { useEffect, useState } from 'react';
import { Redirect, useLocation } from '@docusaurus/router';
import Loading from '../Loading';
import { BASE, LOGOUT_PATH, LOGIN_PATH } from '../../utils/constants';
import keycloak from '../../config/keycloak-config';

export function AuthCheck({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function Auth() {
      try {
        const auth = !keycloak.authenticated
          ? await keycloak.init({ onLoad: 'login-required', KeycloakResponseType: 'code' })
          : keycloak.authenticated;
        if (!auth) {
          window.location.reload();
        } else {
          console.info('Authenticated');
          setUser(keycloak.tokenParsed);
        }
        // setTimeout(() => {
        //   keycloak
        //     .updateToken(70)
        //     .then((refreshed) => {
        //       if (refreshed) {
        //         console.debug('Token refreshed' + refreshed);
        //       } else {
        //         console.warn(
        //           'Token not refreshed, valid for ' +
        //             Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) +
        //             ' seconds',
        //         );
        //       }
        //     })
        //     .catch(() => {
        //       console.error('Failed to refresh token');
        //     });
        // }, 60000);
      } catch (error) {
        console.error(error);
        throw error;
      } finally {
        setAuthLoading(false);
      }
    }
    Auth();
  });

  const location = useLocation();
  let from = location.pathname;

  if (authLoading) return <Loading />;

  if (!user) {
    return keycloak.login();
  }
  if (from === LOGOUT_PATH) {
    keycloak.logout({ redirectUri: window.location.href.replace(LOGOUT_PATH, BASE) });
    return <Redirect to={BASE} from={LOGOUT_PATH} />;
  } else if (from === LOGIN_PATH) return <Redirect to={BASE} from={from} />;
  return children;
}
