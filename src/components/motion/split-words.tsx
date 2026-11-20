import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

/**
 * Splits a headline into words, each sliding up out of its own mask (.line-mask in globals.css).
 * It runs during server rendering, so the reveal is pure CSS and plays from the first paint:
 * the headline is never hidden while JavaScript loads (that hid page titles for ~1.5s and made
 * them the late LCP element). Strings, fragments and simple inline elements (<span>, <em>…) are
 * split; an element keeps its props on every one of its words. Anything else stays one chunk.
 */
export function splitWords(node: ReactNode, { step = 0.04, start = 0 } = {}): ReactNode {
  let i = 0;
  const chunk = (content: ReactNode, key: string) => (
    <span key={key} className="line-mask">
      <span style={{ "--d": `${(start + i++ * step).toFixed(2)}s` } as CSSProperties}>{content}</span>
    </span>
  );
  const words = (text: string, key: string, wrap: (w: string, k: string) => ReactNode = (w) => w) =>
    text
      .split(/(\s+)/)
      .filter(Boolean)
      .map((part, j) => (/^\s+$/.test(part) ? part : chunk(wrap(part, `${key}-${j}`), `${key}-${j}`)));

  const walk = (n: ReactNode, key: string): ReactNode => {
    if (typeof n === "string" || typeof n === "number") return words(String(n), key);
    if (Array.isArray(n)) return n.map((c, j) => walk(c, `${key}.${j}`));
    if (!isValidElement(n)) return n;
    const el = n as ReactElement<{ children?: ReactNode }>;
    if (el.type === Fragment) return <Fragment key={key}>{walk(el.props.children, key)}</Fragment>;
    const kids = Children.toArray(el.props.children);
    if (typeof el.type === "string" && kids.length > 0 && kids.every((k) => typeof k === "string")) {
      return words(kids.join(""), key, (w, k) => cloneElement(el, { key: k }, w));
    }
    return chunk(n, key);
  };

  return walk(node, "w");
}
