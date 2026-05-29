import { useQuery } from '@tanstack/react-query'

type Post = {
  id: number
  title: string
  body: string
  userId: number
}

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10')
  if (!res.ok) throw new Error('Veri çekilemedi')
  return res.json()
}

export default function Welcome() {
  const { data: posts, isLoading, isError, error } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">Hata: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-4">
      <h1 className="text-2xl font-bold">JSONPlaceholder - Gönderiler</h1>
      {posts?.map((post) => (
        <div key={post.id} className="border rounded-lg p-4 space-y-1">
          <p className="text-xs text-muted-foreground">#{post.id} · Kullanıcı {post.userId}</p>
          <h2 className="font-semibold capitalize">{post.title}</h2>
          <p className="text-sm text-muted-foreground">{post.body}</p>
        </div>
      ))}
    </div>
  )
}
