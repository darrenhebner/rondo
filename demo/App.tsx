import * as React from 'react';
import {useForm} from '../src';

export function App() {
  const {Form, errors, pending} = useForm({
    customMessage: {
      title(validity) {
        if (validity.valueMissing) {
          return 'Enter an title';
        }
      },
    },
    async onSubmit(formData, signal) {
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

      return {
        status: 'success',
      };
    },
  });

  return (
    <Form
      className={`container max-w-sm p-4 mx-auto transition-opacity ${
        pending ? 'opacity-50 cursor-wait' : undefined
      }`}
    >
      <fieldset disabled={pending}>
        <label className="block">
          Title
          <input
            required
            type="text"
            name="title"
            aria-invalid={'title' in errors}
            aria-describedby={'title' in errors ? 'titleError' : undefined}
            className={`mt-1 block w-full rounded-md ${
              'title' in errors ? 'border-red-500' : 'border-gray-300'
            } shadow-sm`}
          />
          {'title' in errors ? (
            <span id="titleError" className="text-red-500 text-sm">
              {errors.title.message}
            </span>
          ) : null}
        </label>

        <label className="block">
          Email
          <input
            required
            type="email"
            name="email"
            aria-invalid={'email' in errors}
            aria-describedby={'email' in errors ? 'emailError' : undefined}
            className={`mt-1 block w-full rounded-md ${
              'email' in errors ? 'border-red-500' : 'border-gray-300'
            } shadow-sm`}
          />
          {'email' in errors ? (
            <span id="emailError" className="text-red-500 text-sm">
              {errors.email.message}
            </span>
          ) : null}
        </label>

        <div className="my-4">
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-blue-400 text-white px-4 py-2 rounded"
          >
            Submit
          </button>

          <button type="reset" className="text-gray-500 mx-4">
            Reset
          </button>
        </div>
      </fieldset>
    </Form>
  );
}
