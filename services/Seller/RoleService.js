const { RoleModel, PageModel } = require("../../models/Role");
const ApiError = require("../../utils/apiError");
const { status: httpStatus } = require("http-status");


const createRole = async (roleBody) => {
  const existingRole = await RoleModel.findOne({ name: roleBody.name });
  if (existingRole) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Role already exists");
  }

  const pages = await PageModel.find();
  if (!pages.length) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No pages found to assign permissions"
    );
  }

  const defaultPermissions = pages.map((page) => ({
    page: page._id,
    view: true,
    add: true,
    edit: true,
    delete: true,
  }));

  const role = await RoleModel.create({
    name: roleBody.name,
    permissions: defaultPermissions,
  });

  return role;
};

const fetchRoles = async (req) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  try {
    const roles = await RoleModel.paginate(
      {
        name: { $regex: search, $options: "i" },
      },
      {
        page,
        limit,
        populate: "permissions.page",
      }
    );
    return roles;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving roles"
    );
  }
};

const getRoleById = async (roleId) => {
  const role = await RoleModel.findById(roleId).populate("permissions.page");
  if (!role) throw new ApiError(httpStatus.NOT_FOUND, "Role not found");
  return role;
};

const updateRoleById = async (roleId, updateData) => {
  const role = await RoleModel.findByIdAndUpdate(roleId, updateData, {
    new: true,
    runValidators: true,
  }).populate("permissions.page");
  if (!role) throw new ApiError(httpStatus.NOT_FOUND, "Role not found");
  return role;
};

const deleteRoleById = async (roleId) => {
  const role = await RoleModel.findByIdAndDelete(roleId);
  if (!role) throw new ApiError(httpStatus.NOT_FOUND, "Role not found");
  return role;
};

/**
 * Get role with permissions and merge with all available pages
 * @param {string} roleId - Role ID to fetch
 * @returns {Promise<{ roleName: string; permissions: any[] }>} - Role details with merged permissions
 * @throws {ApiError} - Throws error if role not found
 */
const getRoleWithPermissions = async (roleId) => {
  const role = await RoleModel.findById(roleId).populate("permissions.page");
  if (!role) throw new ApiError(httpStatus.NOT_FOUND, "Role not found");

  // Get all available pages
  const allPages = await PageModel.find();

  // Merge permissions with all pages
  const pagesWithPermissions = allPages.map((page) => {
    const permission = role.permissions.find((p) => p.page.equals(page._id));
    return {
      pageId: page._id,
      pageGroup: page.pageGroup,
      pageName: page.pageName,
      pageLink: page.pageLink,
      permissions: permission || {
        view: false,
        add: false,
        edit: false,
        delete: false,
      },
    };
  });

  return { roleName: role.name, permissions: pagesWithPermissions };
};

const updatePermission = async (roleId, pageId, permissionType) => {
  const role = await RoleModel.findById(roleId);
  if (!role) throw new Error("Role not found");

  const permission = role.permissions.find(
    (perm) => perm.page.toString() === pageId
  );
  if (!permission) throw new Error("Permission not found");

  permission[permissionType] = !permission[permissionType]; // Toggle permission
  await role.save();
  return role;
};

const fetchRoleDropdown = async (req) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  try {
    const roles = await RoleModel.paginate(
      {
        name: { $regex: search, $options: "i" },
      },
      {
        page,
        limit,
        // populate: 'permissions.page',
      }
    );

    const options = roles?.results?.map((item) => {
      return {
        label: item?.name,
        value: item?._id,
      };
    });

    return options;
  } catch (err) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Error retrieving roles"
    );
  }
};

module.exports = {
  createRole,
  fetchRoles,
  getRoleById,
  updateRoleById,
  deleteRoleById,
  getRoleWithPermissions,
  updatePermission,
  fetchRoleDropdown,
};
