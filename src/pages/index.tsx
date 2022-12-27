import { trpc } from "../utils/trpc";

export default function IndexPage() {
  const postList = trpc.post.list.useQuery();

  return (
    <>
      {postList.data?.map((post) => (
        <article key={post.id}>
          <h3>{post.title}</h3>
        </article>
      ))}
    </>
  );
}
