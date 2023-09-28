const REF = Symbol("REF");

export type FunctionRef<T = any> = (value: T | null) => void;
export type ObjectRef<T = any> = { current: T; [REF]: true };
export type Ref<T = any> = FunctionRef<T> | ObjectRef<T>;

interface ObjectRefFactory {
  <T = any>(): ObjectRef<T | null>;
  <T>(initialValue: T): ObjectRef<T>;
}

export const ref: ObjectRefFactory = (...args: Array<any>) => {
  return { [REF]: true as const, current: args.length > 0 ? args[0] : null };
};

export type TagName = keyof HTMLElementTagNameMap;

export type Attrs<SomeTagName extends TagName> = Partial<
  {
    [Key in keyof HTMLElementTagNameMap[SomeTagName]]: Key extends "style"
      ? Partial<CSSStyleDeclaration>
      : Key extends "namespaceURI"
      ? string
      : HTMLElementTagNameMap[SomeTagName][Key];
  } & {
    ref: Ref<HTMLElementTagNameMap[SomeTagName]>;
  }
>;

export type Child = HTMLElement | string | number | null;

export const defaultNodeFactory = (
  type: string | typeof DocumentFragment,
  props: { [key: string]: any }
): Node => {
  if (typeof type !== "string") {
    return document.createDocumentFragment();
  }

  const {
    // props that are handled specially and
    // therefore shouldn't be assigned onto the node
    style,
    ref,
    namespaceURI,
    children,
    tagName,
    ...otherProps
  } = props;

  let node: Node;
  if (namespaceURI) {
    node = document.createElementNS(namespaceURI, type);
  } else {
    node = document.createElement(type);
  }

  if (style != null) {
    Object.assign((node as any).style, style);
  }

  if (ref != null) {
    if (typeof ref === "function") {
      ref(node);
    } else {
      ref.current = node;
    }
  }

  Object.assign(node, otherProps);

  return node;
};

let nodeFactory = defaultNodeFactory;

export const setNodeFactory = (creator: typeof defaultNodeFactory): void => {
  nodeFactory = creator;
};

interface JSXFactory {
  <SomeTagName extends TagName>(
    type: SomeTagName
  ): HTMLElementTagNameMap[SomeTagName];

  <SomeTagName extends TagName, InputAttrs extends Attrs<SomeTagName>>(
    type: SomeTagName,
    attrs: InputAttrs
  ): HTMLElementTagNameMap[SomeTagName];

  <SomeTagName extends TagName>(
    type: SomeTagName,
    attrs: Attrs<SomeTagName>,
    ...children: Array<Child>
  ): HTMLElementTagNameMap[SomeTagName];

  <SomeTagName extends TagName>(
    type: SomeTagName,
    ...children: Array<Child>
  ): HTMLElementTagNameMap[SomeTagName];

  <Result extends HTMLElement>(type: (props: {}) => Result): Result;

  <Result extends HTMLElement, Props extends {}>(
    type: (props: Props) => Result,
    props: Props
  ): Result;

  <Result extends HTMLElement, Props extends {}>(
    type: (props: Props) => Result,
    props: Props,
    ...children: Array<Child>
  ): Result;

  <Result extends HTMLElement>(
    type: (props: {}) => Result,
    ...children: Array<Child>
  ): Result;
}

export const jsx: JSXFactory = (type: any, ...args: Array<any>) => {
  let rawProps: null | { [key: string | number | symbol]: any } = null;
  let children: null | Array<Child> = null;

  if (typeof args[0] === "object" && args[0] != null) {
    // could be props or first child
    if (args[0] instanceof Node) {
      children = args;
    } else {
      rawProps = args[0];
      children = args.slice(1);
    }
  } else {
    // primitive; therefore, child
    children = args;
  }

  children = children.flat(Infinity);

  const props = rawProps || {};

  props.children = children;

  if (type === DocumentFragment || typeof type === "string") {
    // dom node
    const node = nodeFactory(type, props);

    for (const child of children) {
      if (child == null) continue;

      if (typeof child === "object") {
        node.appendChild(child);
      } else {
        const textNode = document.createTextNode(String(child));
        node.appendChild(textNode);
      }
    }

    return node;
  } else {
    // user component function
    return type(props);
  }
};

// for compat when using via aliasing to "react" package instead of jsx fragment config
export const createElement = jsx;
export const Fragment = DocumentFragment;
