# Rondo

A simple library for writing forms in React. Rondo aims to do as little as possible, leveraging the browsers built in form capabilities to do the heavy lifting. This allows us to build powerful forms with little code.

## Resources

Rondo uses native web APIs wherever possible. Here are a couple you will run in to when using the library.

- [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData) - an object that captures your forms data.
- [`ValidityState`](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState) - an interface that represents the reasons a field might be invalid.

## Installation

`yarn add react-rondo`

## Usage

```tsx
import {useForm} from 'react-rondo';

function App() {
  const {Form} = useForm({
    async onSubmit(formData) {
      await fetch('/api', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        return {
          status: 'success'
        }
      } else {
        return {
          status: 'failed',
          errors: {}
        }
      }
    })
  });

  return (
    <Form>
      <label>
        Email
        <input
          type="email"
          name="email"
        />
      </label>

      <input type="submit" />
    </Form>
  );
}
```

### Validation

Rondo leverages the [constraint validation API](https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation) to provide powerful validation right out of the box. All you need to do is decorate your fields with validation attributes such as `required`, `pattern`, or `maxlength`. From there, rondo will gather all of your forms errors and return them in an `errors` object.

The browser provides a ton of built in error messages for all types of scenarios, but if you'd like to override some of these defaults you can do so with the `customMessage` option. Here you can provide a function that returns a custom message for each of your fields. This function will be passed a [`ValidityState`](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState) object to let you know which validations have been triggered.

```tsx
import {useForm} from 'react-rondo';

function App() {
  const {Form, errors} = useForm({
    customMessage: {
      email(validity) {
        if (validity.valueMissing) {
          return 'Make sure to include an email address';
        }

        if (validity.typeMismatch) {
          return 'Please enter a valid email address';
        }
      }
    }
    async onSubmit(formData) {
     // Handle api call
    })
  });

  return (
    <Form>
      <label>
        Email
        <input
          required
          type="email"
          name="email"
          aria-invalid={'email' in errors}
          aria-describedby={'email' in errors ? 'emailError' : undefined}
        />

        {'email' in errors ? (
          <span id="emailError">{errors.email.message}</span>
        ) : null}
      </label>

      <input type="submit" />
    </Form>
  );
}
```

### Cancelling inflight form submissions

Rondo makes it easy to avoid overlapping form submissions. All you need to do to take advantage of this is pass the `signal` to your `fetch` call. Rondo uses an `AbortController` to under the hook to manage this.

```tsx
import {useForm} from 'react-rondo';

function App() {
  const {Form} = useForm({
    async onSubmit(formData, signal) {
      const response = await fetch('/api', {
        method: 'POST',
        body: formData,
        signal,
      });

      if (response.ok) {
        return {
          status: 'success',
        };
      } else {
        return {
          stutus: 'failed',
          errors: {},
        };
      }
    },
  });

  return (
    <Form>
      <label>
        Email
        <input type="email" name="email" />
      </label>

      <input type="submit" />
    </Form>
  );
}
```
