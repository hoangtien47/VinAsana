import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center">
          <span className="text-lg font-bold">TaskMaster</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <a
            href="/api/login"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Log In
          </a>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Task Management Made Simple
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Streamline your projects, collaborate effectively, and track progress with our comprehensive project management solution.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <a href="/api/login">
                    <Button size="lg">Get Started</Button>
                  </a>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1 p-4 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 text-primary"
                          >
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                            <path d="m9 12 2 2 4-4"></path>
                          </svg>
                          <h3 className="font-semibold">Task Management</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Create, assign, and track tasks in one place.
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 p-4 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 text-primary"
                          >
                            <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                            <path d="M9 3v18"></path>
                            <path d="M15 3v18"></path>
                            <path d="M3 9h18"></path>
                            <path d="M3 15h18"></path>
                          </svg>
                          <h3 className="font-semibold">Kanban Boards</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Visualize workflow with customizable Kanban boards.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1 p-4 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 text-primary"
                          >
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                          </svg>
                          <h3 className="font-semibold">Document Storage</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Store and manage project-related documents.
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 p-4 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 text-primary"
                          >
                            <path d="M3 10a7 7 0 1 0 14 0 7 7 0 1 0-14 0"></path>
                            <path d="M21 21h.01"></path>
                            <path d="M3 21h.01"></path>
                            <path d="M12 3v1"></path>
                            <path d="M12 21v-1"></path>
                            <path d="M3 10h1"></path>
                            <path d="m12 13 5.24 3.69"></path>
                          </svg>
                          <h3 className="font-semibold">Performance Analytics</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Track project progress with visual analytics.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t px-4 md:px-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2025 TaskMaster. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500" href="/terms">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-gray-500" href="/privacy">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}