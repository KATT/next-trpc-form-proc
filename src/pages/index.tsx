import { useQueryClient } from "@tanstack/react-query";
import { Form } from "~/utils/Form";
import { trpc } from "../utils/trpc";

export default function IndexPage() {
  const postList = trpc.post.list.useQuery();
  const queryClient = useQueryClient();

  const postAdd = trpc.post.add.useMutation({
    onSuccess() {
      return queryClient.invalidateQueries();
    },
  });

  return (
    <>
      {postList.data?.map((post) => (
        <article key={post.id}>
          <h3>{post.title}</h3>
        </article>
      ))}

      <Form
        mutation={postAdd}
        render={(opts) => (
          <>
            <input type='text' {...opts.form.register("title")} />
            <br />
            <button type='submit' disabled={opts.form.formState.isSubmitting}>
              Submit
            </button>
          </>
        )}
      />
    </>
  );
}
