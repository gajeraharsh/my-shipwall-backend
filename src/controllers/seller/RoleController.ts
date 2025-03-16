import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import ApiResponse from '../../utils/apiResponse';
import ApiError from '../../utils/apiError';

import {
    createRole,
    fetchRoles,
    updateRoleById,
    deleteRoleById,
    getRoleWithPermissions,
    updatePermission
} from '../../services/Seller/RoleService';

// Create Role
export const createRoleController = asyncHandler(async (req: Request, res: Response) => {
    const role = await createRole(req.body);
    return res.status(201).json(new ApiResponse(201, { role }, 'Role created successfully'));
});

// Get All Roles
export const getRolesController = asyncHandler(async (req: Request, res: Response) => {
    const roles = await fetchRoles(req);
    return res.status(200).json(new ApiResponse(200, { roles }, 'Roles retrieved successfully'));
});

// Get Role by ID
export const getRoleByIdController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const role = await getRoleWithPermissions(id);
    if (!role) throw new ApiError(404, 'Role not found');
    return res.status(200).json(new ApiResponse(200, { role }, 'Role retrieved successfully'));
});

// Update Role
export const updateRoleController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedRole = await updateRoleById(id, req.body);
    return res.status(200).json(new ApiResponse(200, { updatedRole }, 'Role updated successfully'));
});

// Delete Role
export const deleteRoleController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await deleteRoleById(id);
    return res.status(200).json(new ApiResponse(200, {}, 'Role deleted successfully'));
});


export const updateRolePermissionController = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { pageId, permissionType } = req.body;

    if (!["view", "add", "edit", "delete"].includes(permissionType)) {
        return res.status(400).json(new ApiResponse(400, {}, "Invalid permission type"));
    }

    const updatedRole = await updatePermission(id, pageId, permissionType);
    res.status(200).json(new ApiResponse(200, updatedRole, "Permission updated successfully"));
});

