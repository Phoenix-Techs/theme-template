import { useEffect, useState } from 'react';
import { createFileRoute, notFound } from '@tanstack/react-router';

import type { ComponentSample } from '../preview/component-sample';

// BannAi's preview shows one component alone, in one of its states, with the
// props its sample file gives. The route exists only in the preview build
// (VITE_BANNAI_PREVIEW, set by the theme image): a published theme answers 404
// and bundles none of the samples.
const PREVIEW = Boolean(import.meta.env.VITE_BANNAI_PREVIEW);

const samples: Record<string, () => Promise<{ sample: ComponentSample }>> = PREVIEW
  ? import.meta.glob<{ sample: ComponentSample }>('../preview/samples/*.tsx')
  : {};

export const Route = createFileRoute('/{-$locale}/{-$locale}/__preview/component/$id')({
  beforeLoad: () => {
    if (!PREVIEW) {
      throw notFound();
    }
  },
  validateSearch: (search: Record<string, unknown>): { state?: string } => ({
    state: typeof search.state === 'string' ? search.state : undefined,
  }),
  component: PreviewComponent,
});

type Loaded = ComponentSample | 'missing' | null;

function PreviewComponent() {
  const { id } = Route.useParams();
  const { state } = Route.useSearch();
  const [loaded, setLoaded] = useState<Loaded>(null);

  // The builder shows "Create sample" over the frame when none exists, so it is told.
  useEffect(() => {
    if (loaded !== null) {
      window.parent?.postMessage(
        { type: 'bannai:component-preview', id, status: loaded === 'missing' ? 'missing' : 'ready' },
        '*'
      );
    }
  }, [id, loaded]);

  useEffect(() => {
    const load = samples[`../preview/samples/${id}.tsx`];
    if (!load) {
      setLoaded('missing');
      return;
    }
    let live = true;
    load().then(
      (mod) => live && setLoaded(mod.sample),
      () => live && setLoaded('missing')
    );
    return () => {
      live = false;
    };
    // `samples` changes when a sample file is added or removed (HMR): look again.
  }, [id, samples]);

  if (loaded === null) {
    return <div className="p-6" data-preview-status="loading" />;
  }
  if (loaded === 'missing') {
    return (
      <div className="p-6 text-center" data-preview-status="missing">
        No sample for “{id}”.
      </div>
    );
  }
  const names = Object.keys(loaded.states);
  const props = loaded.states[state ?? ''] ?? loaded.states[names[0]];
  const Component = loaded.component;
  return (
    <div className="mx-auto max-w-3xl p-6" data-preview-status="ready" data-preview-state={state ?? names[0]}>
      <Component {...props} />
    </div>
  );
}
