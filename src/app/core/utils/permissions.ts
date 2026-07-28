import type {User} from "@/app/core/stores/auth.store";
import type {Workspace, WorkspaceRole} from "@/app/core/service/workspaces.service";
import type {UserData} from "@/app/core/service/users.service";

export function canCreateWorkspace(user?: User): boolean {
    return user?.platformRole === "SUPER_ADMIN";
}

export function getCurrentWorkspaceRole(workspaces: Workspace[], workspaceId?: string): WorkspaceRole | undefined {
    return workspaces.find((workspace) => workspace.id === workspaceId)?.role;
}

export function canManageWorkspaceUsers(role?: WorkspaceRole): boolean {
    return role === "OWNER" || role === "ADMIN";
}

export function canAssignOwner(role?: WorkspaceRole): boolean {
    return role === "OWNER";
}

export function canManageWorkspaceMember(currentRole: WorkspaceRole | undefined, member: UserData): boolean {
    if (!canManageWorkspaceUsers(currentRole)) return false;
    if (currentRole === "OWNER") return true;
    return member.role !== "OWNER";
}

