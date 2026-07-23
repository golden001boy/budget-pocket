import type { ComponentType } from 'react';
import { XAxis, YAxis, Tooltip, Legend, Bar, Area, Pie, Line, ReferenceLine } from 'recharts';

// recharts@2.15.x declares React 19 support in its own peerDependencies and
// works fine with it at runtime, but several of its chart primitives are
// still typed as class components with a one-argument constructor
// (`new (props) => ...`), which React 19's stricter JSX.ElementType no
// longer accepts (it expects `new (props, context) => Component<...>`).
// Re-exporting them cast to a plain component type sidesteps that
// type-only mismatch without touching runtime behavior.
export const XAxisC = XAxis as unknown as ComponentType<any>;
export const YAxisC = YAxis as unknown as ComponentType<any>;
export const TooltipC = Tooltip as unknown as ComponentType<any>;
export const LegendC = Legend as unknown as ComponentType<any>;
export const BarC = Bar as unknown as ComponentType<any>;
export const AreaC = Area as unknown as ComponentType<any>;
export const PieC = Pie as unknown as ComponentType<any>;
export const LineC = Line as unknown as ComponentType<any>;
export const ReferenceLineC = ReferenceLine as unknown as ComponentType<any>;
