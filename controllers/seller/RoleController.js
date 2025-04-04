const { asyncHandler } = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const ApiError = require("../../utils/apiError");

const {
  createRole,
  fetchRoles,
  updateRoleById,
  deleteRoleById,
  getRoleWithPermissions,
  updatePermission,
  fetchRoleDropdown,
} = require("../../services/Seller/RoleService");


// Create Role
const createRoleController = asyncHandler(async (req, res) => {
  const role = await createRole(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, { role }, "Role created successfully"));
});

// Get All Roles
const getRolesController = asyncHandler(async (req, res) => {
  const roles = await fetchRoles(req);
  return res
    .status(200)
    .json(new ApiResponse(200, { roles }, "Roles retrieved successfully"));
});

// Get Role by ID
const getRoleByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const role = await getRoleWithPermissions(id);
  if (!role) throw new ApiError(404, "Role not found");
  return res
    .status(200)
    .json(new ApiResponse(200, { role }, "Role retrieved successfully"));
});

// Update Role
const updateRoleController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedRole = await updateRoleById(id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, { updatedRole }, "Role updated successfully"));
});

// Delete Role
const deleteRoleController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteRoleById(id);
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Role deleted successfully"));
});

const updateRolePermissionController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { pageId, permissionType } = req.body;

  if (!["view", "add", "edit", "delete"].includes(permissionType)) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Invalid permission type"));
  }

  const updatedRole = await updatePermission(id, pageId, permissionType);
  res
    .status(200)
    .json(new ApiResponse(200, updatedRole, "Permission updated successfully"));
});

const getRolesDropdown = asyncHandler(async (req, res) => {
  try {
    const data = await fetchRoleDropdown(req);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { options: data }, "Roles retrieved successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Could not retrieve Roles");
  }
});

module.exports = {
  createRoleController,
  getRolesController,
  getRoleByIdController,
  updateRoleController,
  deleteRoleController,
  updateRolePermissionController,
  getRolesDropdown,
};
