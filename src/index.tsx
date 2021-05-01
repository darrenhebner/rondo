import * as React from 'react';
const {useRef, useEffect, useCallback, useState, useMemo} = React;

type SubmitSuccess = {status: 'success'; updates?: Record<string, string>};
type SubmitFailed = {status: 'failed'; errors: Record<string, string>};

interface Options {
  onSubmit?(
    result: FormData,
    signal: AbortSignal
  ): Promise<SubmitSuccess | SubmitFailed>;
  customMessage?: Record<
    string,
    (validity: ValidityState) => string | undefined
  >;
}

interface FieldError {
  message: string;
  type: ValidityState;
}

const FORM_ELEMENTS = [HTMLInputElement, HTMLTextAreaElement] as const;
type FormElement = InstanceType<typeof FORM_ELEMENTS[number]>;

function isFormElement(element: any): element is FormElement {
  return FORM_ELEMENTS.some((formElement) => element instanceof formElement);
}

function focusInvalidElement(elements: HTMLFormElement['elements']) {
  for (const element of elements) {
    if (isFormElement(element) && !element.validity.valid) {
      element.focus();
      break;
    }
  }
}

export function useForm({customMessage, onSubmit}: Options) {
  const ref = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, FieldError>>({});
  const [pending, setPending] = useState(false);
  const controllerRef = useRef<AbortController>(null);

  const handleSubmit = useCallback(
    async (event: Event) => {
      const form = ref.current;
      if (!form) return;

      controllerRef.current?.abort();
      controllerRef.current = new AbortController();

      const valid = form.checkValidity();

      if (!valid) {
        event.preventDefault();
        focusInvalidElement(form.elements);
        return;
      }

      if (!onSubmit) {
        return;
      }

      event.preventDefault();

      setPending(true);
      const result = await onSubmit(
        new FormData(form),
        controllerRef.current.signal
      );

      if (result.status === 'failed') {
        for (const [key, value] of Object.entries(result.errors)) {
          const element = form.elements.namedItem(key);

          if (!element) {
            throw new Error(
              `Attempted to apply validaton to element that does not exist: ${key}`
            );
          }

          if (isFormElement(element)) {
            element.setCustomValidity(value);
          }
        }

        requestAnimationFrame(() => {
          const valid = form.checkValidity();

          if (!valid) {
            focusInvalidElement(form.elements);
          }
        });
      } else {
        for (const [field, value] of Object.entries(result?.updates ?? {})) {
          const element = form.elements.namedItem(field);

          if (isFormElement(element)) {
            element.value = value;
            element.defaultValue = value;
          }
        }

        setErrors({});
      }

      setPending(false);
    },
    [ref, onSubmit]
  );

  useEffect(() => {
    const form = ref.current;
    if (!form) return;

    function handleInvalid({target: element}: Event) {
      if (isFormElement(element)) {
        element.addEventListener(
          'input',
          () => {
            if (element.validity.customError) {
              element.setCustomValidity('');
            }

            setErrors((prev) => {
              const next = {...prev};
              delete next[element.name];
              return next;
            });
          },
          {once: true}
        );

        const {name, validity, validationMessage} = element;
        const message = customMessage[name]?.(validity);

        setErrors((prev) => ({
          ...prev,
          [name]: {
            message: message ?? validationMessage,
            type: validity,
          },
        }));
      }
    }

    for (const element of form.elements) {
      if (isFormElement(element)) {
        element.addEventListener('invalid', handleInvalid);
      }
    }

    return () => {
      for (const element of form.elements) {
        if (isFormElement(element)) {
          element.removeEventListener('invalid', handleInvalid);
        }
      }
    };
  }, [ref, customMessage]);

  const handleReset = useCallback(() => {
    setErrors({});
  }, []);

  const Form = useMemo(() => {
    return function Form(props: any) {
      return (
        <form
          {...props}
          noValidate
          ref={ref}
          onSubmit={handleSubmit}
          onReset={handleReset}
        />
      );
    };
  }, [handleSubmit, handleReset]);

  return {
    Form,
    pending,
    errors,
    reset() {
      ref.current?.reset();
    },
  };
}
