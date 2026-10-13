"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  project: Project | null;
  projects: Project[];
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  switchProject: (projectId: string) => Promise<void>;
  createProject: (name: string) => Promise<Project | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  project: null,
  projects: [],
  isLoading: true,
  refreshSession: async () => { },
  switchProject: async () => { },
  createProject: async () => null,
  logout: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setProjects(data.projects || []);
          setProject(data.project || (data.projects && data.projects[0]) || null);
        } else {
          setUser(null);
          setProject(null);
          setProjects([]);
        }
      } else {
        setUser(null);
        setProject(null);
        setProjects([]);
      }
    } catch {
      setUser(null);
      setProject(null);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const switchProject = async (projectId: string) => {
    try {
      const res = await fetch("/api/v1/projects/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch {
    }
  };

  const createProject = async (name: string): Promise<Project | null> => {
    try {
      const res = await fetch("/api/v1/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const data = await res.json();
        window.location.reload();
        return data.project;
      }
      return null;
    } catch {
      return null;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setProject(null);
      setProjects([]);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        project,
        projects,
        isLoading,
        refreshSession: fetchSession,
        switchProject,
        createProject,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
