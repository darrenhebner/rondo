import * as React from 'react';
import {useForm} from '../src';

const {useCallback} = React;

export function App() {
  const {Form, errors, pending} = useForm({
    customMessage: {
      email(validity) {
        if (validity.valueMissing) {
          return 'Enter an email!';
        }
      },
    },
    onSubmit: useCallback(async (formData, signal) => {
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/posts',
        {
          method: 'POST',
          body: formData,
          signal,
        }
      );

      if (!response.ok) {
        throw new Error('API update failed');
      }

      const data = await response.json();
      console.log(data);
      return {
        status: 'success',
      };
    }, []),
  });

  return (
    <Form
      className={`container max-w-sm mx-auto transition-opacity ${
        pending ? 'opacity-50 cursor-wait' : undefined
      }`}
    >
      {/* <fieldset disabled={pending}> */}
      <label className="block">
        Title
        <input
          required
          type="text"
          name="title"
          aria-invalid={'title' in errors}
          aria-describedby={'title' in errors ? 'titleError' : undefined}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {'title' in errors ? (
          <span id="titleError" className="text-red-500 text-sm">
            {errors.title.message}
          </span>
        ) : null}
      </label>

      <button
        type="submit"
        className="bg-gradient-to-r from-blue-500 to-blue-400 text-white px-4 py-2 rounded"
      >
        Submit
      </button>

      <button type="reset" className="text-gray-500 mx-4">
        Reset
      </button>
      {/* </fieldset> */}
    </Form>
  );
}
