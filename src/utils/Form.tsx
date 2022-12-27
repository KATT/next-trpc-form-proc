import { useForm, UseFormProps, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "./trpc";
import { UseTRPCMutationResult } from "@trpc/react-query/shared";
import type zodToJsonSchema from "zod-to-json-schema";
import { z as zod, ZodSchema, ZodType } from "zod";
import { jsonSchemaToZod } from "json-schema-to-zod";
import { useState } from "react";
import { JsonSchema7Type } from "zod-to-json-schema/src/parseDef";

function useZodForm<TSchema extends ZodType>(
  props: Omit<UseFormProps<TSchema["_input"]>, "resolver"> & {
    schema: TSchema;
  },
) {
  const form = useForm<TSchema["_input"]>({
    ...props,
    resolver: zodResolver(props.schema, undefined),
  });

  return form;
}

type FormRender<TVariables extends object> = (props: {
  form: UseFormReturn<TVariables>;
}) => JSX.Element;

function FormInner<TData, TError, TVariables extends object, TContext>(props: {
  mutation: UseTRPCMutationResult<TData, TError, TVariables, TContext>;
  render: FormRender<TVariables>;
  schema: JsonSchema7Type;
}) {
  const [schema] = useState(() => {
    // lol @ this working, `jsonSchemaToZod` is a function that returns a string and not a zod schema
    const str = jsonSchemaToZod(props.schema);

    // declare zod in scope for hacking purposes
    const z = zod;
    const toEval = str.substring(
      'import { z } from "zod";\n\nexport default '.length,
    );

    return eval(toEval) as ZodType<any>;
  });

  const form = useZodForm({
    schema,
  });

  return (
    <form
      method='post'
      onSubmit={form.handleSubmit((values) => {
        return props.mutation.mutateAsync(values);
      })}
    >
      {props.render({ form })}
    </form>
  );
}

export function Form<
  TData,
  TError,
  TVariables extends object,
  TContext,
>(props: {
  mutation: UseTRPCMutationResult<TData, TError, TVariables, TContext>;
  render: FormRender<TVariables>;
}) {
  const query = trpc.getFormProcInput.useQuery({
    path: props.mutation.trpc.path,
  });

  console.log("query", query.data);

  if (query.status === "success") {
    return <FormInner {...props} schema={query.data} />;
  }
  if (query.status === "error") {
    return <div>{query.error.message}</div>;
  }

  return <>Loading form...</>;
}
