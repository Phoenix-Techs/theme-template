import type { ComponentType } from 'react';

/**
 * What a component's sample file (`app/preview/samples/<id>.tsx`) exports as
 * `sample`: the component and the props for each of its states (the `states`
 * of its entry in `.builder/components.json`). The isolated preview route
 * renders one state at a time.
 */
export interface ComponentSample<P extends object = Record<string, unknown>> {
  component: ComponentType<P>;
  states: Record<string, P>;
}
