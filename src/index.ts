export type Ref<T = any> = { current: T };

interface RefFactory {
  <T = any>(): Ref<T | null>;
  <T>(initialValue: T): Ref<T>;
}

export const ref: RefFactory = (...args: Array<any>) => {
  return { current: args.length > 0 ? args[0] : null };
};

export type Attrs<TagName extends keyof HTMLElementTagNameMap> = Partial<
  {
    [Key in keyof HTMLElementTagNameMap[TagName]]: Key extends "style"
      ? Partial<CSSStyleDeclaration>
      : HTMLElementTagNameMap[TagName][Key];
  } & {
    ref: Ref<HTMLElementTagNameMap[TagName]>;
  }
>;

export type Child = HTMLElement | string | number | null;

interface JSXFactory {
  <TagName extends keyof HTMLElementTagNameMap>(
    type: TagName
  ): HTMLElementTagNameMap[TagName];

  <
    TagName extends keyof HTMLElementTagNameMap,
    InputAttrs extends Attrs<TagName>
  >(
    type: TagName,
    attrs: InputAttrs
  ): HTMLElementTagNameMap[TagName];

  <TagName extends keyof HTMLElementTagNameMap>(
    type: TagName,
    attrs: Attrs<TagName>,
    ...children: Array<Child>
  ): HTMLElementTagNameMap[TagName];

  <TagName extends keyof HTMLElementTagNameMap>(
    type: TagName,
    ...children: Array<Child>
  ): HTMLElementTagNameMap[TagName];

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
  let el: HTMLElement | DocumentFragment | null = null;
  if (type === DocumentFragment) {
    el = document.createDocumentFragment();
  } else if (typeof type === "string") {
    el = document.createElement(type);
  }

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

  children.flat(Infinity);

  const props = rawProps || {};

  if (el != null) {
    // DOM element
    const { style, ref, ...otherProps } = props;

    if (style != null) {
      if (!(el instanceof DocumentFragment)) {
        Object.assign(el.style, style);
      }
    }

    if (ref != null) {
      ref.current = el;
    }

    Object.assign(el, otherProps);

    for (const child of children) {
      if (child == null) continue;

      if (typeof child === "object") {
        el.appendChild(child);
      } else {
        const textNode = document.createTextNode(String(child));
        el.appendChild(textNode);
      }
    }

    return el;
  } else {
    // user component
    props.children = children;
    return type(props);
  }
};
