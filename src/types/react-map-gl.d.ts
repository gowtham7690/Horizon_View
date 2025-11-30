declare module 'react-map-gl/mapbox' {
  import { Component, Ref } from 'react';
  import { Map as MapboxMap } from 'mapbox-gl';

  export interface ViewState {
    longitude: number;
    latitude: number;
    zoom?: number;
    pitch?: number;
    bearing?: number;
  }

  export interface MapProps {
    mapboxAccessToken: string;
    mapStyle?: string;
    initialViewState?: ViewState;
    viewState?: ViewState;
    onMove?: (evt: { viewState: ViewState }) => void;
    reuseMaps?: boolean;
    preventStyleDiffing?: boolean;
    ref?: Ref<MapRef>;
    children?: React.ReactNode;
  }

  export interface MapRef {
    getMap(): MapboxMap;
  }

  export const Map: React.ComponentType<MapProps>;
}

