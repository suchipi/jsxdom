# `@suchipi/jsxdom`

> JSX factory that creates HTML elements directly

Use JSX as syntax sugar for `document.createElement`, `Object.assign(element.style, {/* ... */})`, etc.

## Installation

```sh
npm install --save @suchipi/jsxdom
```

## Usage

If using TypeScript, put these in your tsconfig.json's `compilerOptions`:

```json
"jsx": "react",
"jsxFactory": "jsx",
"jsxFragmentFactory": "DocumentFragment",
```

Or, if using Babel, provide these options to `@babel/plugin-transform-react-jsx`:

```json
"pragma": "jsx",
"pragmaFrag": "DocumentFragment",
```

Then, use the library in your code like so:

```tsx
import { jsx, ref } from "@suchipi/jsxdom";

const upButton = ref();

const myDiv = (
  <div>
    <button ref={upButton} onclick={() => console.log("up!")}>
      Up
    </button>
    <button
      onclick={() => console.log("down!")}
      style={{ backgroundColor: "red" }}
    >
      Down
    </button>
  </div>
);

console.log(myDiv); // HTMLDivElement
console.log(upButton); // { current: HTMLButtonElement }
```

It also supports user components:

```tsx
function MyComponent(props) {
  return <div {...props} />;
}

const myDiv = <MyComponent id="hi" />;

console.log(myDiv); // HTMLDivElement
```

Notes:

- `jsx` must be in-scope to use JSX.
- `ref` creates React-style ref objects, shaped like `{ current: any }`.
- There's no re-rendering logic here. You can use this to get an initial element tree, but modifying it after that point is up to you.
- Use eg `onclick` instead of `onClick`, `className` instead of `class`.
  - Because it's using the HTMLElement property names.
- The result of every JSX expression is an HTMLElement (or DocumentFragment if you use JSX fragment syntax).
- To attach the resulting HTMLElement(s) to the DOM, use `document.body.appendChild` or etc.
- Every prop passed to a JSX element will be assigned to the HTMLElement directly, except for `ref` and `style`:
  - When a `ref` prop is present, the HTMLElement will be written to the ref's `current` property.
  - When a `style` prop is present, its properties will be assigned onto the HTMLElement's `style` property.
