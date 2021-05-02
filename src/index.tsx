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
  const [errors, setErrors] = useState<Record<string, FieldError>>({});
  const [pending, setPending] = useState(false);
  const controllerRef = useRef<AbortController>(null);
  const submitRef = useRef(onSubmit);
  const customMessageRef = useRef(customMessage);

  useEffect(() => {
    submitRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    customMessageRef.current = customMessage;
  }, []);

  const handleSubmit = useCallback(
    async (event: React.SyntheticEvent<HTMLFormElement>) => {
      const form = event.target as HTMLFormElement;

      controllerRef.current?.abort();
      controllerRef.current = new AbortController();

      const valid = form.checkValidity();

      if (!valid) {
        event.preventDefault();
        focusInvalidElement(form.elements);
        return;
      }

      if (!submitRef.current) {
        return;
      }

      event.preventDefault();

      setPending(true);
      const result = await submitRef.current(
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
    []
  );

  const handleInvalid = useCallback(({target}: React.SyntheticEvent) => {
    if (isFormElement(target)) {
      target.addEventListener(
        'input',
        () => {
          if (target.validity.customError) {
            target.setCustomValidity('');
          }

          setErrors((prev) => {
            const next = {...prev};
            delete next[target.name];
            return next;
          });
        },
        {once: true}
      );

      const {name, validity, validationMessage} = target;
      const message = customMessageRef.current[name]?.(validity);

      setErrors((prev) => ({
        ...prev,
        [name]: {
          message: message ?? validationMessage,
          type: validity,
        },
      }));
    }
  }, []);

  const handleReset = useCallback(() => {
    setErrors({});
  }, []);

  const Form = useMemo(() => {
    return function Form(props: any) {
      return (
        <form
          {...props}
          noValidate
          onSubmit={handleSubmit}
          onReset={handleReset}
          onInvalid={handleInvalid}
        />
      );
    };
  }, [handleSubmit, handleReset, handleInvalid]);

  return {
    Form,
    pending,
    errors,
  };
}
