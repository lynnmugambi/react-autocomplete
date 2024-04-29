1. ## What is the difference between Component and PureComponent in React? Give an example where it might break my app.

A `Component` would usually re-render every time its parent component does or when its state changes, whereas, a `PureComponent` implements a shallow comparison on both props and state, automatically. This means that the component will not re-render if the props and state have not changed, potentially improving performance but also potential bugs if not used carefully.

One way this can cause issues is when the props or state are objects or arrays. Since `PureComponent` only performs a shallow comparison, it might not detect changes in nested properties of objects or arrays (as it checks for equality by references, not the contents), leading to unexpected behavior. In such cases, it's better to use `Component` and handle the comparison manually.

```jsx
class App extends React.PureComponent {
  state = {
    user: {
      name: 'John',
      age: 25
    }
  };

  handleClick = () => {
    const user = this.state.user;
    user.age++;
    this.setState({ user });
  };

  render() {
    console.log('rendered');
    return (
      <div>
        <p>{this.state.user.name}</p>
        <p>{this.state.user.age}</p>
        <button onClick={this.handleClick}>Increase Age</button>
      </div>
    );
  }
}
```
in the above example, the `App` component is a `PureComponent` and the `user` object is being mutated directly in the `handleClick` method. Since `PureComponent` does a shallow comparison, it won't detect the change in the `user` object and will not re-render the component, leading to the UI not being updated as expected.

PureComponents are recommended when you can safely predict that your props and state are simple and change infrequently, therefore avoiding costly re-renders. For more complex scenarios involving deep data structures, it is better to use `React.memo` for functional components or implementing a custom `shouldComponentUpdate` for deeper comparisons.

2. ## Context + ShouldComponentUpdate might be dangerous. Why is that?
React’s `Context` is intended to be used for sharing data that can be considered “global” within a tree of React components, such as the presently authenticated user, theme, or preferred language. Rather than manually passing down props at each level, it offers a way to do so indirectly.

It is dangerous to use `shouldComponentUpdate` with `Context` because `shouldComponentUpdate` lets React know whether a change in state or props affects a component’s output. If this method returns `false`, the component will not re-render and stale data or UI state may be displayed even when `Context` is updated.

3. ## Describe 3 ways to pass information from a component to its PARENT.

1. **Using Callbacks/Props**: By passing a callback function as a prop to the child element, a the child component can be called upon to send information back to the parent component.

2. **Using Context**: By using React Context, a parent component can provide a context to its child components, which can then consume the context and send information back to the parent.

3. **Using State Management Libraries**: With state management libraries like Redux or MobX, state can be shared across components. A child component can dispatch an action to update the state, which can then be accessed by the parent component.

4. ## Give 2 ways to prevent components from re-rendering.

1. **Using React.memo**: For functional components, `React.memo` can be used to memoize the component based on its props. It will only re-render if the props have changed.

```jsx
const MyComponent = React.memo(({ prop }) => {
  return <div>{prop}</div>;
});
```
2. **Using shouldComponentUpdate**: For class components, `shouldComponentUpdate` can be implemented to prevent re-rendering based on certain conditions. It should return `false` if the component should not re-render.

```jsx
class MyComponent extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (this.props.prop === nextProps.prop) {
      return false;
    }
    return true;
  }

  render() {
    return <div>{this.props.prop}</div>;
  }
}
```

5. ## What is a fragment and why do we need it? Give an example where it might break my app.

A fragment is a way to group multiple children elements under a single parent element without adding extra nodes to the DOM. It is represented by the `<React.Fragment>` or shorthand `<>` syntax.
It may break your app if you are using a fragment as a parent element and applying certain CSS styles or selectors that depend on a specific parent-child relationship in the DOM. Since fragments do not add an extra node to the DOM, the CSS selectors may not work as expected.

```jsx
const App = () => {
  return (
    <ul>
      <>
      <ol>...</ol>
      <ol>...</ol>
      </>
    </ul>
  );
};
```
In the above example, if the CSS styles are dependent on a parent-child relationship between `ul` and `ol`, using a fragment might break the styling. In such cases, it is better to use a wrapper `<div>` or another parent element to maintain the expected DOM structure.

6. ## Give 3 examples of the HOC pattern.

Higher Order Components or HOC are functions that take a component as an argument and return a new component. They are helpful to abstract a shared logic used by many components.

1. **withAuth**: An HOC that checks if the user is authenticated and redirects to the login page if not.

```jsx
const withAuth = (Component) => {
  const AuthComponent = (props) => {
    const isAuthenticated = checkAuth();
    if (!isAuthenticated) {
      return <Redirect to="/login" />;
    }
    return <Component {...props} />;
  };

  return AuthComponent;
};
```
2. **withLoading**: An HOC that displays a loading spinner while data is being fetched.

```jsx
const withLoading = (Component) => {
  const LoadingComponent = (props) => {
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
      fetchData().then(() => setLoading(false));
    }, []);

    return isLoading ? <Spinner /> : <Component {...props} />;
  };

  return LoadingComponent;
};
```

3. **withLogging**: An HOC that logs the lifecycle methods of a component.

```jsx
const withLogging = (Component) => {
  class LoggingComponent extends React.Component {
    componentDidMount() {
      console.log('Component mounted');
    }

    componentWillUnmount() {
      console.log('Component will unmount');
    }

    render() {
      return <Component {...this.props} />;
    }
  }

  return LoggingComponent;
};
```


7. ## What's the difference in handling exceptions in promises, callbacks and async...await?

1. **Promises**: In promises, errors can be handled using the `.catch()` method, which allows you to catch any errors that occurred in the promise chain. If an error is thrown inside a `.then()` block, it will be caught by the nearest `.catch()` block in the chain.

```javascript
fetch('https://api.example.com/data')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

2. **Callbacks**: In callbacks, errors are typically handled as the first argument in the callback function. It is a common pattern to pass an error as the first argument and the result as the second argument to the callback function.

```javascript
function fetchData(callback) {
  if (error) {
    callback(new Error('An error occurred'));
  } else {
    callback(null, 'Data fetched successfully');
  }
}

fetchData((error, result) => {
  if (error) {
    console.error(error);
  } else {
    console.log(result);
  }
});
```

3. **Async/Await**: In async/await, errors can be handled using `try/catch` blocks. The `try` block contains the code that may throw an error, and the `catch` block handles the error if one occurs.

```javascript
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

fetchData();
```

8. ## How many arguments does setState take and why is it async.

`setState` can take two different forms of arguments: an object or a function. When an object is passed to `setState`, it merges the object into the current state. When a function is passed, it receives the previous state and props as arguments and returns a new state object.
It is asynchronous because React does not immediately update the component state. Instead, it schedules an update and tells React to re-render the component with the new state at the next render.  To get the updated state immediately after calling `setState`, you can pass a callback function as the second argument to `setState`.
eg.
```jsx
incrementCount = () => {
  this.setState((prevState) => ({ count: prevState.count + 1 }), () => {
    console.log('Updated count:', this.state.count);
  });
};
```


9. ## List the steps needed to migrate a Class to Function Component.

1. **State**: Convert class properties to `useState` hooks.
2. **Lifecycle Methods**: Replace lifecycle methods with `useEffect` hook.
3. **Refs**: Replace `this.refs` with `useRef` hook.
4. **Event Handlers**: Convert event handlers to `useCallback` hook.
5. **Context**: Use `useContext` hook to consume context.
6. **Props**: Access props directly in the function component.
7. **Render Method**: Return JSX directly from the function component.

10. ## List a few ways styles can be used with components.

1. **Inline Styles**: Styles can be applied directly to JSX elements using the `style` attribute.
2. **CSS Classes**: CSS classes can be applied to JSX elements using the `className` attribute.
3. **CSS Modules**: CSS Modules allow scoping CSS locally to a component.
4. **CSS-in-JS Libraries**: Libraries like styled-components or emotion allow writing CSS directly in JavaScript files.
5. **CSS Preprocessors**: Preprocessors like SASS or LESS can be used to write stylesheets that are compiled to CSS.
6. **Global Stylesheets**: Global stylesheets can be imported and applied to the entire application.

11. ## How to render an HTML string coming from the server.

To render an HTML string coming from the server, you can use the `dangerouslySetInnerHTML` attribute in React which is used to render raw HTML strings in React elements. It should be used with caution as it can expose your application to XSS attacks if the HTML string is not sanitized.
eg.
```jsx 
const App = () => {
  const htmlString = '<div>Hello, World!</div>';

  return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
};
```
