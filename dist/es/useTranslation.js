import _defineProperty from "@babel/runtime/helpers/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

import { useState, useEffect, useContext } from 'react';
import { getI18n, getDefaults, ReportNamespaces, getHasUsedI18nextProvider, I18nContext } from './context';
import { warnOnce, loadNamespaces, hasLoadedNamespace } from './utils';
export function useTranslation(ns) {
  var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  // assert we have the needed i18nInstance
  var i18nFromProps = props.i18n;

  var _ref = getHasUsedI18nextProvider() ? useContext(I18nContext) || {} : {},
      i18nFromContext = _ref.i18n,
      defaultNSFromContext = _ref.defaultNS;

  var i18n = i18nFromProps || i18nFromContext || getI18n();
  if (i18n && !i18n.reportNamespaces) i18n.reportNamespaces = new ReportNamespaces();

  if (!i18n) {
    warnOnce('You will need pass in an i18next instance by using initReactI18next');
    var retNotReady = [function (k) {
      return k;
    }, {}, true];

    retNotReady.t = function (k) {
      return k;
    };

    retNotReady.i18n = {};
    retNotReady.ready = true;
    return retNotReady;
  }

  var i18nOptions = _objectSpread({}, getDefaults(), {}, i18n.options.react);

  var _props$useSuspense = props.useSuspense,
      useSuspense = _props$useSuspense === void 0 ? i18nOptions.useSuspense : _props$useSuspense; // prepare having a namespace

  var namespaces = ns || defaultNSFromContext || i18n.options && i18n.options.defaultNS;
  namespaces = typeof namespaces === 'string' ? [namespaces] : namespaces || ['translation']; // report namespaces as used

  if (i18n.reportNamespaces.addUsedNamespaces) i18n.reportNamespaces.addUsedNamespaces(namespaces); // are we ready? yes if all namespaces in first language are loaded already (either with data or empty object on failed load)

  var ready = (i18n.isInitialized || i18n.initializedStoreOnce) && namespaces.every(function (n) {
    return hasLoadedNamespace(n, i18n);
  }); // binding t function to namespace (acts also as rerender trigger)

  function getT() {
    return {
      t: i18n.getFixedT(null, i18nOptions.nsMode === 'fallback' ? namespaces : namespaces[0])
    };
  }

  var t = getT(); // seems we can't have functions as value -> wrap it in obj

  /*   const [t, setT] = useState(getT()); // seems we can't have functions as value -> wrap it in obj
  
    useEffect(() => {
      let isMounted = true;
      const { bindI18n, bindI18nStore } = i18nOptions;
  
      // if not ready and not using suspense load the namespaces
      // in side effect and do not call resetT if unmounted
      if (!ready && !useSuspense) {
        loadNamespaces(i18n, namespaces, () => {
          if (isMounted) setT(getT());
        });
      }
  
      function boundReset() {
        if (isMounted) setT(getT());
      }
  
      // bind events to trigger change, like languageChanged
      if (bindI18n && i18n) i18n.on(bindI18n, boundReset);
      if (bindI18nStore && i18n) i18n.store.on(bindI18nStore, boundReset);
  
      // unbinding on unmount
      return () => {
        isMounted = false;
        if (bindI18n && i18n) bindI18n.split(' ').forEach(e => i18n.off(e, boundReset));
        if (bindI18nStore && i18n)
          bindI18nStore.split(' ').forEach(e => i18n.store.off(e, boundReset));
      };
    }, [namespaces.join()]); // re-run effect whenever list of namespaces changes
  */

  var ret = [t.t, i18n, ready];
  ret.t = t.t;
  ret.i18n = i18n;
  ret.ready = ready; // return hook stuff if ready

  if (ready) return ret; // not yet loaded namespaces -> load them -> and return if useSuspense option set false

  if (!ready && !useSuspense) return ret; // not yet loaded namespaces -> load them -> and trigger suspense

  throw new Promise(function (resolve) {
    loadNamespaces(i18n, namespaces, function () {
      setT(getT());
      resolve();
    });
  });
}