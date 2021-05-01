# Rondo

A simple library for writing forms in React. 📋

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

### Custom error messages

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

Rondo makes it easy to avoid overlapping form submissions. All you need to do to take advantage of this is pass the `signal` to your `fetch` call.

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
