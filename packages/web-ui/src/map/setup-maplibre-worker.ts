import { setRTLTextPlugin, setWorkerUrl } from 'maplibre-gl';
import rtlTextPluginUrl from '../../node_modules/@mapbox/mapbox-gl-rtl-text/dist/mapbox-gl-rtl-text.js?url';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

setWorkerUrl(workerUrl);
void setRTLTextPlugin(rtlTextPluginUrl, true);
