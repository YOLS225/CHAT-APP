import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkspaceStore {
    currentWorkspaceId?: string;
    setCurrentWorkspaceId: (workspaceId?: string) => void;
    resetWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
    persist(
        (set) => ({
            currentWorkspaceId: undefined,
            setCurrentWorkspaceId: (workspaceId?: string) => set({currentWorkspaceId: workspaceId}),
            resetWorkspace: () => set({currentWorkspaceId: undefined}),
        }),
        {name: "Workspace-store"}
    )
);

