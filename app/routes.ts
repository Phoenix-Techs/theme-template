import { route, type VirtualRouteNode } from '@tanstack/virtual-file-routes';

// Add or replace routes here, e.g. `route('/faq', 'faq.tsx')` from '@tanstack/virtual-file-routes'.
export const routes: VirtualRouteNode[] = [
  // BannAi's isolated component preview (404 outside the preview build).
  route('/{-$locale}/__preview/component/$id', 'preview-component.tsx'),
];
