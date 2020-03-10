# @harpsealjs/microfe

An easy micro-frontend framework

## Installation

```bash
$ npm install --save @harpsealjs/microfe
```

## Usage

### Host Application

```javascript
import { Microfe } from '@harpsealjs/microfe';

const app = new Microfe();

app
  .register({
    title: 'Child APP 1',
    assets: [
      '/my/child/app/1.js',
      '/my/child/app/1.css'
    ],
    base: '/',
    exact: true,
    path: '/'
  })
  .register({
    title: 'Child APP 2',
    assets: [
      '/my/child/app/2.js',
      '/my/child/app/2.css'
    ],
    base: '/child2',
    path: [
      '/child2'
    ]
  })
  .register({
    title: 'Child APP 3',
    assets: [
      '/my/child/app/3.js',
      '/my/child/app/3.css'
    ],
    base: '/child3',
    path: [
      '/child3'
    ]
  })
  .root(document.getElementById('root') as HTMLElement)
  .start();
```

### Child Application

```js
import { getChildContext } from '@harpsealjs/microfe';
const { root, base, hashType, onAppLeave } = getChildContext();

onAppLeave(() => {
  ReactDOM.unmountComponentAtNode(root);
});

// react
ReactDOM.render((
  <App />
), root);

// with react-router
ReactDOM.render((
  <Router basename={base} hashType={hashType}>
    {/* ... */}
  </Router>
), root);
```

When you need to route to other child apps, use `pushState` and `replaceState`

```js
import { pushState, replaceState } from '@harpsealjs/microfe';

export default function (props) {
  return (
    <div>
      <button onClick={() => pushState('/child1')}>Child1</button>
      <button onClick={() => pushState('/child2')}>Child2</button>
      <button onClick={() => replaceState('/child3')}>Child3</button>
    </div>
  );
}
```

## Documentation


## License

The MIT License (MIT)

Copyright (c) 2015

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.