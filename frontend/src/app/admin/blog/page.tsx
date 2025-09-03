"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, LogOut, PlusCircle, Trash2, X } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Post {
  id: number;
  title: string;
  slug: string;
  date: string;
}

export default function AdminManageBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState<number | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
          throw new Error("Failed to fetch posts.");
        }
        const data = await response.json();
        setPosts(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      }
    };
    fetchPosts();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { 
      method: 'POST',
      credentials: 'include' 
    });
    router.push('/admin/login');
  };

  const handleDelete = (id: number) => {
    setPostIdToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!postIdToDelete) return;
    
    try {
      const response = await fetch(`/api/posts/${postIdToDelete}`, { 
        method: 'DELETE',
        credentials: 'include' 
      });
      if (!response.ok) {
        throw new Error("Failed to delete post.");
      }
      setPosts(posts.filter(p => p.id !== postIdToDelete));
      setIsDeleteDialogOpen(false);
      setPostIdToDelete(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <AuthGuard>
      <main className="min-h-screen bg-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              <Button variant="outline" size="icon" onClick={handleLogout} aria-label="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold">Manage Blog Posts</h1>
              <Link href="/admin/blog/new">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </Link>
            </div>
          </header>

          <Card>
            <CardContent className="pt-6">
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <div className="space-y-4">
                {posts.length > 0 ? posts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <h3 className="font-semibold">{post.title}</h3>
                      <p className="text-sm text-slate-500">{`/blog/${post.slug} • Published: ${post.date}`}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/blog/edit/${post.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>Delete</Button>
                    </div>
                  </div>
                )) : <p className="text-slate-500">No blog posts found. Click "New Post" to get started.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Custom Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the selected post.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
}
