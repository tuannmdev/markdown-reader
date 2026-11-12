// react-markdown passes the hast `node` to custom components; it must not reach the DOM.
export function stripNode<T extends { node?: unknown }>(props: T): Omit<T, "node"> {
  const { node, ...rest } = props;
  void node;
  return rest;
}
